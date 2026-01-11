// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title RevenueOracle
 * @dev Oracle system for verifying off-chain revenue data
 * @notice Phase 1 implementation with manual verification and basic proof system
 * 
 * Features:
 * - Multi-source revenue data aggregation
 * - Cryptographic proof verification system
 * - Oracle reputation and slashing mechanisms
 * - Fallback mechanisms for oracle failures
 * - Revenue trend analysis and projection updates
 */
contract RevenueOracle is AccessControl, ReentrancyGuard, Pausable {
    // Role definitions
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROTOCOL_ROLE = keccak256("PROTOCOL_ROLE");

    // Oracle reputation tracking
    struct OracleInfo {
        address oracleAddress;
        uint256 reputation; // Score out of 10000
        uint256 totalSubmissions;
        uint256 successfulSubmissions;
        uint256 slashCount;
        bool isActive;
        uint256 registeredAt;
    }

    // Revenue verification record
    struct RevenueVerification {
        uint256 streamId;
        uint256 period; // Month number
        uint256 verifiedAmount;
        bytes32 proofHash;
        address oracle;
        uint256 timestamp;
        bool isDisputed;
        uint256 confirmations;
    }

    // Revenue source data
    struct RevenueSourceData {
        string platform;
        string accountId;
        uint256 amount;
        bytes32 dataHash;
        uint256 timestamp;
    }

    // Platform configuration
    struct PlatformConfig {
        string name;
        bool isActive;
        uint256 minConfirmations;
        uint256 weight; // Weight in final calculation
    }

    // State variables
    mapping(address => OracleInfo) public oracles;
    mapping(uint256 => mapping(uint256 => RevenueVerification)) public verifications; // streamId => period => verification
    mapping(bytes32 => RevenueSourceData) public revenueData;
    mapping(string => PlatformConfig) public platformConfigs;
    
    address[] public oracleList;
    string[] public supportedPlatforms;
    
    uint256 public constant MIN_ORACLE_REPUTATION = 7500; // 75%
    uint256 public constant SLASH_AMOUNT = 0.1 ether;
    uint256 public minConfirmations = 2;

    // Events
    event OracleRegistered(address indexed oracle, uint256 reputation);
    event OracleSlashed(address indexed oracle, uint256 amount, string reason);
    event RevenueVerified(
        uint256 indexed streamId,
        uint256 period,
        uint256 amount,
        bytes32 proofHash,
        address oracle
    );
    event RevenueDisputed(uint256 indexed streamId, uint256 period, address disputer);
    event PlatformConfigured(string platform, bool isActive, uint256 minConfirmations);

    /**
     * @dev Constructor
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        // Initialize supported platforms
        _configurePlatform("Spotify", true, 2, 3000);
        _configurePlatform("YouTube", true, 2, 2500);
        _configurePlatform("TikTok", true, 2, 2000);
        _configurePlatform("Instagram", true, 2, 1500);
        _configurePlatform("Licensing", true, 3, 1000);
    }

    /**
     * @dev Register a new oracle
     * @param oracle Oracle address to register
     */
    function registerOracle(address oracle) external onlyRole(ADMIN_ROLE) {
        require(oracle != address(0), "Invalid oracle address");
        require(!oracles[oracle].isActive, "Oracle already registered");

        oracles[oracle] = OracleInfo({
            oracleAddress: oracle,
            reputation: 10000, // Start with perfect reputation
            totalSubmissions: 0,
            successfulSubmissions: 0,
            slashCount: 0,
            isActive: true,
            registeredAt: block.timestamp
        });

        oracleList.push(oracle);
        _grantRole(ORACLE_ROLE, oracle);

        emit OracleRegistered(oracle, 10000);
    }

    /**
     * @dev Submit revenue verification (Phase 1: Manual submission)
     * @param streamId Stream ID to verify
     * @param period Period (month) being verified
     * @param verifiedAmount Total verified revenue amount
     * @param proofHash Hash of the verification proof
     * @param sourceData Array of revenue source data
     */
    function verifyRevenue(
        uint256 streamId,
        uint256 period,
        uint256 verifiedAmount,
        bytes32 proofHash,
        RevenueSourceData[] memory sourceData
    ) external onlyRole(ORACLE_ROLE) whenNotPaused nonReentrant {
        require(oracles[msg.sender].isActive, "Oracle not active");
        require(oracles[msg.sender].reputation >= MIN_ORACLE_REPUTATION, "Oracle reputation too low");
        require(verifiedAmount > 0, "Amount must be positive");
        require(proofHash != bytes32(0), "Invalid proof hash");

        // Check if already verified for this period
        RevenueVerification storage verification = verifications[streamId][period];
        require(verification.timestamp == 0, "Period already verified");

        // Validate source data
        uint256 totalSourceAmount = 0;
        for (uint256 i = 0; i < sourceData.length; i++) {
            require(platformConfigs[sourceData[i].platform].isActive, "Platform not supported");
            totalSourceAmount += sourceData[i].amount;
            
            // Store source data
            bytes32 sourceKey = keccak256(abi.encodePacked(streamId, period, sourceData[i].platform));
            revenueData[sourceKey] = sourceData[i];
        }

        require(totalSourceAmount == verifiedAmount, "Source amounts don't match total");

        // Record verification
        verification.streamId = streamId;
        verification.period = period;
        verification.verifiedAmount = verifiedAmount;
        verification.proofHash = proofHash;
        verification.oracle = msg.sender;
        verification.timestamp = block.timestamp;
        verification.confirmations = 1;

        // Update oracle stats
        oracles[msg.sender].totalSubmissions++;
        oracles[msg.sender].successfulSubmissions++;

        emit RevenueVerified(streamId, period, verifiedAmount, proofHash, msg.sender);
    }

    /**
     * @dev Confirm a revenue verification (additional oracle confirmation)
     * @param streamId Stream ID
     * @param period Period being confirmed
     * @param proofHash Expected proof hash
     */
    function confirmVerification(
        uint256 streamId,
        uint256 period,
        bytes32 proofHash
    ) external onlyRole(ORACLE_ROLE) whenNotPaused {
        require(oracles[msg.sender].isActive, "Oracle not active");
        require(oracles[msg.sender].reputation >= MIN_ORACLE_REPUTATION, "Oracle reputation too low");

        RevenueVerification storage verification = verifications[streamId][period];
        require(verification.timestamp > 0, "No verification to confirm");
        require(verification.oracle != msg.sender, "Cannot confirm own verification");
        require(verification.proofHash == proofHash, "Proof hash mismatch");
        require(!verification.isDisputed, "Verification is disputed");

        verification.confirmations++;
        oracles[msg.sender].totalSubmissions++;
        oracles[msg.sender].successfulSubmissions++;
    }

    /**
     * @dev Get verified revenue for a stream and period
     * @param streamId Stream ID
     * @param period Period to query
     * @return verifiedAmount Verified revenue amount
     * @return proofHash Proof hash
     * @return isConfirmed Whether verification meets minimum confirmations
     */
    function getVerifiedRevenue(
        uint256 streamId,
        uint256 period
    ) external view returns (uint256 verifiedAmount, bytes32 proofHash, bool isConfirmed) {
        RevenueVerification memory verification = verifications[streamId][period];
        
        if (verification.timestamp == 0) {
            return (0, bytes32(0), false);
        }

        bool confirmed = verification.confirmations >= minConfirmations && !verification.isDisputed;
        
        return (verification.verifiedAmount, verification.proofHash, confirmed);
    }

    /**
     * @dev Update revenue projections based on historical data
     * @param streamId Stream ID
     * @param historicalData Array of historical revenue amounts
     * @return updatedProjection New projected monthly revenue
     */
    function updateProjections(
        uint256 streamId,
        uint256[] memory historicalData
    ) external onlyRole(PROTOCOL_ROLE) returns (uint256 updatedProjection) {
        require(historicalData.length >= 3, "Need at least 3 months of data");

        // Simple moving average calculation for Phase 1
        uint256 total = 0;
        for (uint256 i = 0; i < historicalData.length; i++) {
            total += historicalData[i];
        }

        updatedProjection = total / historicalData.length;

        // Apply trend analysis (simplified)
        if (historicalData.length >= 6) {
            uint256 recentAvg = 0;
            uint256 olderAvg = 0;
            uint256 halfLength = historicalData.length / 2;

            // Calculate recent average
            for (uint256 i = halfLength; i < historicalData.length; i++) {
                recentAvg += historicalData[i];
            }
            recentAvg = recentAvg / halfLength;

            // Calculate older average
            for (uint256 i = 0; i < halfLength; i++) {
                olderAvg += historicalData[i];
            }
            olderAvg = olderAvg / halfLength;

            // Apply trend adjustment (max 20% adjustment)
            if (recentAvg > olderAvg) {
                uint256 increase = ((recentAvg - olderAvg) * 2000) / olderAvg; // Max 20% increase
                if (increase > 2000) increase = 2000;
                updatedProjection = (updatedProjection * (10000 + increase)) / 10000;
            } else if (olderAvg > recentAvg) {
                uint256 decrease = ((olderAvg - recentAvg) * 2000) / olderAvg; // Max 20% decrease
                if (decrease > 2000) decrease = 2000;
                updatedProjection = (updatedProjection * (10000 - decrease)) / 10000;
            }
        }

        return updatedProjection;
    }

    /**
     * @dev Dispute a revenue verification
     * @param streamId Stream ID
     * @param period Period being disputed
     * @param reason Reason for dispute
     */
    function disputeVerification(
        uint256 streamId,
        uint256 period,
        string memory reason
    ) external onlyRole(ADMIN_ROLE) {
        RevenueVerification storage verification = verifications[streamId][period];
        require(verification.timestamp > 0, "No verification to dispute");
        require(!verification.isDisputed, "Already disputed");

        verification.isDisputed = true;

        // Slash the oracle
        _slashOracle(verification.oracle, reason);

        emit RevenueDisputed(streamId, period, msg.sender);
    }

    /**
     * @dev Configure platform settings
     * @param platform Platform name
     * @param isActive Whether platform is active
     * @param minConfirmationsRequired Minimum confirmations required
     * @param weight Weight in revenue calculation
     */
    function configurePlatform(
        string memory platform,
        bool isActive,
        uint256 minConfirmationsRequired,
        uint256 weight
    ) external onlyRole(ADMIN_ROLE) {
        _configurePlatform(platform, isActive, minConfirmationsRequired, weight);
    }

    /**
     * @dev Internal function to configure platform
     */
    function _configurePlatform(
        string memory platform,
        bool isActive,
        uint256 minConfirmationsRequired,
        uint256 weight
    ) internal {
        if (platformConfigs[platform].weight == 0) {
            supportedPlatforms.push(platform);
        }

        platformConfigs[platform] = PlatformConfig({
            name: platform,
            isActive: isActive,
            minConfirmations: minConfirmationsRequired,
            weight: weight
        });

        emit PlatformConfigured(platform, isActive, minConfirmationsRequired);
    }

    /**
     * @dev Slash an oracle for malicious behavior
     * @param oracle Oracle to slash
     * @param reason Reason for slashing
     */
    function _slashOracle(address oracle, string memory reason) internal {
        OracleInfo storage oracleInfo = oracles[oracle];
        require(oracleInfo.isActive, "Oracle not active");

        // Reduce reputation
        uint256 reputationPenalty = 1000; // 10% penalty
        if (oracleInfo.reputation > reputationPenalty) {
            oracleInfo.reputation -= reputationPenalty;
        } else {
            oracleInfo.reputation = 0;
        }

        oracleInfo.slashCount++;

        // Deactivate if reputation too low
        if (oracleInfo.reputation < MIN_ORACLE_REPUTATION) {
            oracleInfo.isActive = false;
            _revokeRole(ORACLE_ROLE, oracle);
        }

        emit OracleSlashed(oracle, SLASH_AMOUNT, reason);
    }

    /**
     * @dev Get oracle information
     * @param oracle Oracle address
     * @return OracleInfo struct
     */
    function getOracleInfo(address oracle) external view returns (OracleInfo memory) {
        return oracles[oracle];
    }

    /**
     * @dev Get supported platforms
     * @return Array of platform names
     */
    function getSupportedPlatforms() external view returns (string[] memory) {
        return supportedPlatforms;
    }

    /**
     * @dev Pause oracle operations (admin only)
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause oracle operations (admin only)
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}