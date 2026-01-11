// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CashflowToken
 * @dev ERC-20 token representing fractional ownership of future cashflows
 * @notice This token provides dividend distribution and yield calculation utilities
 * 
 * Features:
 * - ERC-20 standard with dividend distribution mechanism
 * - Expiration date enforcement with automatic burning
 * - Transfer restrictions for compliance requirements
 * - Yield calculation utilities and projected return functions
 * - Dividend claiming and distribution tracking
 */
contract CashflowToken is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {
    // Token parameters
    uint256 public immutable durationMonths;
    uint256 public immutable createdAt;
    uint256 public immutable expirationDate;
    address public immutable protocolContract;

    // Dividend tracking
    uint256 public totalDividendsDistributed;
    uint256 public currentDividendPerToken;
    mapping(address => uint256) public lastClaimedDividendPerToken;
    mapping(address => uint256) public unclaimedDividends;

    // Distribution records
    struct DistributionRecord {
        uint256 amount;
        uint256 timestamp;
        uint256 period; // Month number (1-based)
        bytes32 proofHash;
    }

    DistributionRecord[] public distributionHistory;

    // Compliance and restrictions
    mapping(address => bool) public transferRestricted;
    bool public transfersEnabled;

    // Events
    event DividendsDistributed(uint256 amount, uint256 dividendPerToken, uint256 period);
    event DividendsClaimed(address indexed holder, uint256 amount);
    event TransferRestrictionUpdated(address indexed account, bool restricted);
    event TransfersToggled(bool enabled);
    event TokenExpired(uint256 totalBurned);

    /**
     * @dev Constructor for CashflowToken
     * @param name Token name
     * @param symbol Token symbol
     * @param totalSupply Total token supply (equals tokenized revenue amount)
     * @param _durationMonths Duration of the cashflow stream in months
     * @param _protocolContract Address of the protocol contract
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint256 _durationMonths,
        address _protocolContract
    ) ERC20(name, symbol) Ownable(msg.sender) {
        require(totalSupply > 0, "Total supply must be positive");
        require(_durationMonths > 0, "Duration must be positive");
        require(_protocolContract != address(0), "Invalid protocol contract");

        durationMonths = _durationMonths;
        createdAt = block.timestamp;
        expirationDate = block.timestamp + (_durationMonths * 30 days); // Approximate
        protocolContract = _protocolContract;
        transfersEnabled = true;

        // Mint all tokens to the protocol contract initially
        _mint(_protocolContract, totalSupply);
    }

    /**
     * @dev Distribute dividends to all token holders
     * @param amount Total dividend amount to distribute
     * @param period Month period (1-based)
     * @param proofHash Hash of the revenue verification proof
     */
    function distributeDividends(
        uint256 amount,
        uint256 period,
        bytes32 proofHash
    ) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be positive");
        require(block.timestamp < expirationDate, "Token has expired");
        require(period > 0 && period <= durationMonths, "Invalid period");

        uint256 totalSupply = totalSupply();
        require(totalSupply > 0, "No tokens in circulation");

        // Calculate dividend per token
        uint256 dividendPerToken = (amount * 1e18) / totalSupply;
        currentDividendPerToken += dividendPerToken;
        totalDividendsDistributed += amount;

        // Record distribution
        distributionHistory.push(DistributionRecord({
            amount: amount,
            timestamp: block.timestamp,
            period: period,
            proofHash: proofHash
        }));

        emit DividendsDistributed(amount, dividendPerToken, period);
    }

    /**
     * @dev Claim accumulated dividends
     */
    function claimDividends() external nonReentrant {
        uint256 dividends = getUnclaimedDividends(msg.sender);
        require(dividends > 0, "No dividends to claim");

        lastClaimedDividendPerToken[msg.sender] = currentDividendPerToken;
        unclaimedDividends[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: dividends}("");
        require(success, "Dividend transfer failed");

        emit DividendsClaimed(msg.sender, dividends);
    }

    /**
     * @dev Get unclaimed dividends for a holder
     * @param holder Address of the token holder
     * @return Amount of unclaimed dividends
     */
    function getUnclaimedDividends(address holder) public view returns (uint256) {
        uint256 balance = balanceOf(holder);
        if (balance == 0) return 0;

        uint256 newDividendPerToken = currentDividendPerToken - lastClaimedDividendPerToken[holder];
        uint256 newDividends = (balance * newDividendPerToken) / 1e18;
        
        return unclaimedDividends[holder] + newDividends;
    }

    /**
     * @dev Calculate current yield rate (APY)
     * @return Yield rate in basis points
     */
    function getYieldRate() external view returns (uint256) {
        if (totalDividendsDistributed == 0 || distributionHistory.length == 0) {
            return 0;
        }

        // Calculate annualized yield based on recent distributions
        uint256 recentDistributions = 0;
        uint256 monthsToCheck = distributionHistory.length > 12 ? 12 : distributionHistory.length;
        
        for (uint256 i = distributionHistory.length - monthsToCheck; i < distributionHistory.length; i++) {
            recentDistributions += distributionHistory[i].amount;
        }

        uint256 averageMonthlyDistribution = recentDistributions / monthsToCheck;
        uint256 annualizedDistribution = averageMonthlyDistribution * 12;
        uint256 totalSupply = totalSupply();

        if (totalSupply == 0) return 0;

        // Return yield rate in basis points (10000 = 100%)
        return (annualizedDistribution * 10000) / totalSupply;
    }

    /**
     * @dev Get remaining duration in months
     * @return Months remaining until expiration
     */
    function getRemainingDuration() external view returns (uint256) {
        if (block.timestamp >= expirationDate) {
            return 0;
        }
        return (expirationDate - block.timestamp) / 30 days;
    }

    /**
     * @dev Get projected returns for a holder
     * @param holder Address of the token holder
     * @return Projected total returns based on current yield
     */
    function getProjectedReturns(address holder) external view returns (uint256) {
        uint256 balance = balanceOf(holder);
        if (balance == 0) return 0;

        uint256 remainingMonths = this.getRemainingDuration();
        if (remainingMonths == 0) return 0;

        // Calculate projected returns based on recent performance
        uint256 yieldRate = this.getYieldRate();
        uint256 monthlyYield = yieldRate / 12; // Convert annual to monthly
        
        return (balance * monthlyYield * remainingMonths) / 10000;
    }

    /**
     * @dev Get distribution history
     * @return Array of distribution records
     */
    function getDistributionHistory() external view returns (DistributionRecord[] memory) {
        return distributionHistory;
    }

    /**
     * @dev Check if token has expired
     * @return Whether token has expired
     */
    function hasExpired() public view returns (bool) {
        return block.timestamp >= expirationDate;
    }

    /**
     * @dev Burn expired tokens (callable by anyone after expiration)
     */
    function burnExpiredTokens() external {
        require(hasExpired(), "Token has not expired");
        
        uint256 totalSupply = totalSupply();
        if (totalSupply > 0) {
            // Burn all remaining tokens
            _burn(address(this), balanceOf(address(this)));
            
            // Burn tokens from all holders (this is a simplified approach)
            // In practice, you'd need a more sophisticated mechanism
            emit TokenExpired(totalSupply);
        }
    }

    /**
     * @dev Set transfer restriction for an account (compliance)
     * @param account Account to restrict/unrestrict
     * @param restricted Whether to restrict transfers
     */
    function setTransferRestriction(address account, bool restricted) external onlyOwner {
        transferRestricted[account] = restricted;
        emit TransferRestrictionUpdated(account, restricted);
    }

    /**
     * @dev Toggle transfers globally (compliance)
     * @param enabled Whether transfers are enabled
     */
    function setTransfersEnabled(bool enabled) external onlyOwner {
        transfersEnabled = enabled;
        emit TransfersToggled(enabled);
    }

    /**
     * @dev Override transfer to include compliance checks
     */
    function _update(address from, address to, uint256 value) internal override {
        require(transfersEnabled, "Transfers are disabled");
        require(!transferRestricted[from], "Sender is restricted");
        require(!transferRestricted[to], "Recipient is restricted");
        require(!hasExpired(), "Token has expired");

        // Update dividend tracking for both parties
        if (from != address(0)) {
            _updateDividends(from);
        }
        if (to != address(0)) {
            _updateDividends(to);
        }

        super._update(from, to, value);
    }

    /**
     * @dev Update dividend tracking for an account
     * @param account Account to update
     */
    function _updateDividends(address account) internal {
        uint256 balance = balanceOf(account);
        if (balance > 0) {
            uint256 newDividendPerToken = currentDividendPerToken - lastClaimedDividendPerToken[account];
            uint256 newDividends = (balance * newDividendPerToken) / 1e18;
            unclaimedDividends[account] += newDividends;
        }
        lastClaimedDividendPerToken[account] = currentDividendPerToken;
    }

    /**
     * @dev Receive function to accept dividend payments
     */
    receive() external payable {
        // Accept dividend payments from protocol
        require(msg.sender == owner() || msg.sender == protocolContract, "Unauthorized");
    }
}