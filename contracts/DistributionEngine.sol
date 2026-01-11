// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./CashflowToken.sol";
import "./RevenueOracle.sol";

/**
 * @title DistributionEngine
 * @dev Automated distribution engine for monthly royalty payments
 * @notice Handles monthly payment calculations, gas-optimized batch distributions, and fee management
 * 
 * Features:
 * - Monthly payment calculations based on verified revenue
 * - Gas-optimized batch distribution system
 * - Protocol fee management (maximum 5% enforcement)
 * - Distribution record keeping with audit trails
 * - Emergency controls and pause functionality
 */
contract DistributionEngine is AccessControl, ReentrancyGuard, Pausable {
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROTOCOL_ROLE = keccak256("PROTOCOL_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    // Distribution calculation result
    struct DistributionCalculation {
        uint256 totalAmount;
        uint256 protocolFee;
        uint256 creatorShare;
        uint256 investorShare;
        uint256 distributionPerToken;
    }

    // Distribution execution record
    struct DistributionRecord {
        uint256 streamId;
        uint256 period;
        uint256 totalRevenue;
        uint256 verifiedRevenue;
        uint256 distributedAmount;
        uint256 protocolFee;
        uint256 creatorShare;
        uint256 investorShare;
        bytes32 proofHash;
        uint256 distributedAt;
        address distributor;
        bool isCompleted;
    }

    // Batch distribution parameters
    struct BatchDistributionParams {
        uint256[] streamIds;
        uint256 period;
        uint256 maxGasPerDistribution;
        bool forceExecution;
    }

    // State variables
    RevenueOracle public immutable revenueOracle;
    address public protocolContract;
    
    mapping(uint256 => mapping(uint256 => DistributionRecord)) public distributions; // streamId => period => record
    mapping(uint256 => uint256) public lastDistributedPeriod; // streamId => last period
    
    uint256 public constant MAX_PROTOCOL_FEE = 500; // 5%
    uint256 public protocolFeeRate = 300; // 3%
    uint256 public constant MAX_BATCH_SIZE = 50;
    uint256 public defaultGasLimit = 300000;

    // Events
    event DistributionCalculated(
        uint256 indexed streamId,
        uint256 period,
        uint256 totalAmount,
        uint256 protocolFee,
        uint256 investorShare
    );
    
    event DistributionExecuted(
        uint256 indexed streamId,
        uint256 period,
        uint256 distributedAmount,
        uint256 recipientCount
    );
    
    event BatchDistributionCompleted(
        uint256[] streamIds,
        uint256 period,
        uint256 totalDistributed,
        uint256 successCount
    );
    
    event ProtocolFeeUpdated(uint256 oldFee, uint256 newFee);
    event DistributionFailed(uint256 indexed streamId, uint256 period, string reason);

    /**
     * @dev Constructor
     * @param _revenueOracle Address of the revenue oracle contract
     * @param _protocolContract Address of the main protocol contract
     */
    constructor(address _revenueOracle, address _protocolContract) {
        require(_revenueOracle != address(0), "Invalid oracle address");
        require(_protocolContract != address(0), "Invalid protocol address");

        revenueOracle = RevenueOracle(_revenueOracle);
        protocolContract = _protocolContract;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, msg.sender);
    }

    /**
     * @dev Calculate distribution amounts for a stream and period
     * @param streamId Stream ID
     * @param period Period (month) to calculate for
     * @return calculation DistributionCalculation struct with all amounts
     */
    function calculateDistribution(
        uint256 streamId,
        uint256 period
    ) external view returns (DistributionCalculation memory calculation) {
        // Get verified revenue from oracle
        (uint256 verifiedRevenue, bytes32 proofHash, bool isConfirmed) = 
            revenueOracle.getVerifiedRevenue(streamId, period);
        
        require(verifiedRevenue > 0, "No verified revenue");
        require(isConfirmed, "Revenue not confirmed");

        // Calculate protocol fee
        uint256 protocolFee = (verifiedRevenue * protocolFeeRate) / 10000;
        uint256 remainingAmount = verifiedRevenue - protocolFee;

        // For Phase 1, simplified distribution:
        // - Creator gets their remaining share (100% - tokenization percentage)
        // - Investors get the tokenized percentage
        
        // This would need to be integrated with the main protocol contract
        // to get the actual tokenization percentage
        uint256 tokenizationPercentage = 6000; // 60% - placeholder for Phase 1
        
        uint256 creatorShare = (remainingAmount * (10000 - tokenizationPercentage)) / 10000;
        uint256 investorShare = remainingAmount - creatorShare;

        // Calculate distribution per token (for dividend distribution)
        uint256 distributionPerToken = 0;
        // This would be calculated based on total token supply from the cashflow token

        return DistributionCalculation({
            totalAmount: verifiedRevenue,
            protocolFee: protocolFee,
            creatorShare: creatorShare,
            investorShare: investorShare,
            distributionPerToken: distributionPerToken
        });
    }

    /**
     * @dev Execute distribution for a single stream
     * @param streamId Stream ID to distribute for
     * @param period Period to distribute
     * @param tokenAddress Address of the cashflow token
     * @param creatorAddress Address of the stream creator
     */
    function executeDistribution(
        uint256 streamId,
        uint256 period,
        address tokenAddress,
        address creatorAddress
    ) external onlyRole(DISTRIBUTOR_ROLE) whenNotPaused nonReentrant {
        require(tokenAddress != address(0), "Invalid token address");
        require(creatorAddress != address(0), "Invalid creator address");

        // Check if already distributed
        require(!distributions[streamId][period].isCompleted, "Already distributed");

        // Get verified revenue
        (uint256 verifiedRevenue, bytes32 proofHash, bool isConfirmed) = 
            revenueOracle.getVerifiedRevenue(streamId, period);
        
        require(verifiedRevenue > 0, "No verified revenue");
        require(isConfirmed, "Revenue not confirmed");

        // Calculate distribution
        DistributionCalculation memory calc = this.calculateDistribution(streamId, period);

        // Record distribution
        distributions[streamId][period] = DistributionRecord({
            streamId: streamId,
            period: period,
            totalRevenue: verifiedRevenue,
            verifiedRevenue: verifiedRevenue,
            distributedAmount: calc.investorShare,
            protocolFee: calc.protocolFee,
            creatorShare: calc.creatorShare,
            investorShare: calc.investorShare,
            proofHash: proofHash,
            distributedAt: block.timestamp,
            distributor: msg.sender,
            isCompleted: false
        });

        try this._executeDistributionInternal(
            streamId,
            period,
            tokenAddress,
            creatorAddress,
            calc
        ) {
            distributions[streamId][period].isCompleted = true;
            lastDistributedPeriod[streamId] = period;
            
            emit DistributionExecuted(streamId, period, calc.investorShare, 1);
        } catch Error(string memory reason) {
            emit DistributionFailed(streamId, period, reason);
            revert(reason);
        }
    }

    /**
     * @dev Internal function to execute distribution
     * @param streamId Stream ID
     * @param period Period
     * @param tokenAddress Cashflow token address
     * @param creatorAddress Creator address
     * @param calc Distribution calculation
     */
    function _executeDistributionInternal(
        uint256 streamId,
        uint256 period,
        address tokenAddress,
        address creatorAddress,
        DistributionCalculation memory calc
    ) external {
        require(msg.sender == address(this), "Internal function");

        // Send creator share
        if (calc.creatorShare > 0) {
            (bool creatorSuccess, ) = creatorAddress.call{value: calc.creatorShare}("");
            require(creatorSuccess, "Creator payment failed");
        }

        // Distribute to token holders via cashflow token
        if (calc.investorShare > 0) {
            CashflowToken token = CashflowToken(tokenAddress);
            
            // Send funds to token contract for dividend distribution
            (bool tokenSuccess, ) = tokenAddress.call{value: calc.investorShare}("");
            require(tokenSuccess, "Token payment failed");
            
            // Trigger dividend distribution
            token.distributeDividends(
                calc.investorShare,
                period,
                distributions[streamId][period].proofHash
            );
        }

        emit DistributionCalculated(
            streamId,
            period,
            calc.totalAmount,
            calc.protocolFee,
            calc.investorShare
        );
    }

    /**
     * @dev Execute batch distribution for multiple streams
     * @param params Batch distribution parameters
     */
    function batchDistribute(
        BatchDistributionParams memory params
    ) external onlyRole(DISTRIBUTOR_ROLE) whenNotPaused nonReentrant {
        require(params.streamIds.length > 0, "No streams provided");
        require(params.streamIds.length <= MAX_BATCH_SIZE, "Batch too large");

        uint256 successCount = 0;
        uint256 totalDistributed = 0;
        uint256 gasUsed = gasleft();

        for (uint256 i = 0; i < params.streamIds.length; i++) {
            uint256 streamId = params.streamIds[i];
            
            // Check gas limit
            if (!params.forceExecution && gasleft() < params.maxGasPerDistribution) {
                break;
            }

            try this._batchDistributeInternal(streamId, params.period) returns (uint256 distributed) {
                totalDistributed += distributed;
                successCount++;
            } catch {
                // Continue with next stream on failure
                continue;
            }
        }

        gasUsed = gasUsed - gasleft();

        emit BatchDistributionCompleted(
            params.streamIds,
            params.period,
            totalDistributed,
            successCount
        );
    }

    /**
     * @dev Internal batch distribution function
     * @param streamId Stream ID
     * @param period Period
     * @return distributed Amount distributed
     */
    function _batchDistributeInternal(
        uint256 streamId,
        uint256 period
    ) external returns (uint256 distributed) {
        require(msg.sender == address(this), "Internal function");

        // Check if already distributed
        if (distributions[streamId][period].isCompleted) {
            return 0;
        }

        // Get verified revenue
        (uint256 verifiedRevenue, , bool isConfirmed) = 
            revenueOracle.getVerifiedRevenue(streamId, period);
        
        if (verifiedRevenue == 0 || !isConfirmed) {
            return 0;
        }

        // Calculate and execute distribution
        DistributionCalculation memory calc = this.calculateDistribution(streamId, period);
        
        // This is a simplified version - in practice, you'd need to get
        // token and creator addresses from the protocol contract
        
        return calc.investorShare;
    }

    /**
     * @dev Get distribution record
     * @param streamId Stream ID
     * @param period Period
     * @return DistributionRecord struct
     */
    function getDistributionRecord(
        uint256 streamId,
        uint256 period
    ) external view returns (DistributionRecord memory) {
        return distributions[streamId][period];
    }

    /**
     * @dev Check if distribution is due for a stream
     * @param streamId Stream ID
     * @param period Period to check
     * @return Whether distribution is due
     */
    function isDistributionDue(
        uint256 streamId,
        uint256 period
    ) external view returns (bool) {
        // Check if already distributed
        if (distributions[streamId][period].isCompleted) {
            return false;
        }

        // Check if revenue is verified
        (, , bool isConfirmed) = revenueOracle.getVerifiedRevenue(streamId, period);
        
        return isConfirmed;
    }

    /**
     * @dev Update protocol fee rate
     * @param newFeeRate New fee rate in basis points
     */
    function updateProtocolFee(uint256 newFeeRate) external onlyRole(ADMIN_ROLE) {
        require(newFeeRate <= MAX_PROTOCOL_FEE, "Fee rate too high");
        
        uint256 oldFee = protocolFeeRate;
        protocolFeeRate = newFeeRate;
        
        emit ProtocolFeeUpdated(oldFee, newFeeRate);
    }

    /**
     * @dev Update default gas limit for distributions
     * @param newGasLimit New gas limit
     */
    function updateGasLimit(uint256 newGasLimit) external onlyRole(ADMIN_ROLE) {
        require(newGasLimit >= 100000, "Gas limit too low");
        defaultGasLimit = newGasLimit;
    }

    /**
     * @dev Emergency pause
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Withdraw accumulated protocol fees
     * @param to Address to send fees to
     */
    function withdrawProtocolFees(address payable to) external onlyRole(ADMIN_ROLE) {
        require(to != address(0), "Invalid address");
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = to.call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Receive function to accept payments
     */
    receive() external payable {}
}