// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "./CashflowToken.sol";

/**
 * @title CashflowProtocol
 * @dev Core protocol contract for tokenizing future royalty streams
 * @notice This contract manages stream registration, tokenization, and investment flows
 * 
 * Features:
 * - Stream registration with metadata validation
 * - Cashflow token creation and management
 * - Investment processing with risk disclosure
 * - Role-based access control (Creator, Investor, Admin)
 * - Emergency pause functionality
 * - Upgradeable proxy pattern for future updates
 */
contract CashflowProtocol is 
    Initializable, 
    UUPSUpgradeable,
    AccessControlUpgradeable, 
    PausableUpgradeable, 
    ReentrancyGuardUpgradeable 
{
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    bytes32 public constant INVESTOR_ROLE = keccak256("INVESTOR_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    // Stream counter
    uint256 private _nextStreamId;

    // Protocol fee (in basis points, max 500 = 5%)
    uint256 public protocolFee;
    uint256 public constant MAX_PROTOCOL_FEE = 500; // 5%

    // Minimum requirements
    uint256 public constant MIN_REVENUE_HISTORY_MONTHS = 6;
    uint256 public constant MAX_TOKENIZATION_PERCENTAGE = 8000; // 80%
    uint256 public minimumInvestment;

    // Revenue source structure
    struct RevenueSource {
        string platform;        // e.g., "Spotify", "YouTube", "TikTok"
        string accountId;       // Platform-specific account identifier
        bytes32 verificationHash; // Hash of verification data
        uint256 historicalRevenue; // Historical revenue in wei
        uint256 weight;         // Weight in revenue calculation (basis points)
        bool isActive;          // Whether source is active
    }

    // Stream metadata structure
    struct StreamMetadata {
        address creator;
        string title;
        string description;
        RevenueSource[] sources;
        uint256 projectedMonthlyRevenue; // In wei
        uint256 durationMonths;
        uint256 minimumInvestment;
        string ipfsMetadataHash;
        uint256 createdAt;
        bool isActive;
    }

    // Stream information structure
    struct StreamInfo {
        StreamMetadata metadata;
        address tokenAddress;
        uint256 totalInvestment;
        uint256 tokenizationPercentage; // In basis points
        uint256 totalTokenSupply;
        bool isTokenized;
        uint256 investorCount;
    }

    // Investment record structure
    struct Investment {
        address investor;
        uint256 amount;
        uint256 tokenAmount;
        uint256 investedAt;
        bool riskAcknowledged;
    }

    // Mappings
    mapping(uint256 => StreamInfo) public streams;
    mapping(uint256 => Investment[]) public streamInvestments;
    mapping(address => uint256[]) public creatorStreams;
    mapping(address => uint256[]) public investorStreams;
    mapping(uint256 => mapping(address => bool)) public hasInvested;

    // Events
    event StreamRegistered(
        uint256 indexed streamId,
        address indexed creator,
        string title,
        uint256 projectedMonthlyRevenue,
        uint256 durationMonths
    );

    event StreamTokenized(
        uint256 indexed streamId,
        address indexed tokenAddress,
        uint256 tokenizationPercentage,
        uint256 totalSupply
    );

    event InvestmentMade(
        uint256 indexed streamId,
        address indexed investor,
        uint256 amount,
        uint256 tokenAmount
    );

    event ProtocolFeeUpdated(uint256 oldFee, uint256 newFee);
    event MinimumInvestmentUpdated(uint256 oldAmount, uint256 newAmount);

    /**
     * @dev Initialize the protocol contract
     * @param _protocolFee Initial protocol fee in basis points
     * @param _minimumInvestment Minimum investment amount in wei
     */
    function initialize(
        uint256 _protocolFee,
        uint256 _minimumInvestment
    ) public initializer {
        require(_protocolFee <= MAX_PROTOCOL_FEE, "Protocol fee too high");
        
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        // Initialize parameters
        protocolFee = _protocolFee;
        minimumInvestment = _minimumInvestment;
        _nextStreamId = 1;
    }

    /**
     * @dev Register a new royalty stream
     * @param title Stream title
     * @param description Stream description
     * @param sources Array of revenue sources
     * @param projectedMonthlyRevenue Projected monthly revenue in wei
     * @param durationMonths Stream duration in months
     * @param streamMinimumInvestment Minimum investment for this stream
     * @param ipfsMetadataHash IPFS hash for additional metadata
     * @return streamId The ID of the registered stream
     */
    function registerStream(
        string memory title,
        string memory description,
        RevenueSource[] memory sources,
        uint256 projectedMonthlyRevenue,
        uint256 durationMonths,
        uint256 streamMinimumInvestment,
        string memory ipfsMetadataHash
    ) external whenNotPaused returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(sources.length > 0, "At least one revenue source required");
        require(projectedMonthlyRevenue > 0, "Projected revenue must be positive");
        require(durationMonths >= MIN_REVENUE_HISTORY_MONTHS, "Duration too short");
        require(streamMinimumInvestment >= minimumInvestment, "Investment below minimum");

        // Validate revenue sources
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < sources.length; i++) {
            require(bytes(sources[i].platform).length > 0, "Platform name required");
            require(sources[i].weight > 0, "Source weight must be positive");
            totalWeight += sources[i].weight;
        }
        require(totalWeight == 10000, "Source weights must sum to 100%");

        uint256 streamId = _nextStreamId++;

        // Create stream metadata
        StreamMetadata storage metadata = streams[streamId].metadata;
        metadata.creator = msg.sender;
        metadata.title = title;
        metadata.description = description;
        metadata.projectedMonthlyRevenue = projectedMonthlyRevenue;
        metadata.durationMonths = durationMonths;
        metadata.minimumInvestment = streamMinimumInvestment;
        metadata.ipfsMetadataHash = ipfsMetadataHash;
        metadata.createdAt = block.timestamp;
        metadata.isActive = true;

        // Store revenue sources
        for (uint256 i = 0; i < sources.length; i++) {
            metadata.sources.push(sources[i]);
        }

        // Initialize stream info
        streams[streamId].totalInvestment = 0;
        streams[streamId].isTokenized = false;
        streams[streamId].investorCount = 0;

        // Track creator's streams
        creatorStreams[msg.sender].push(streamId);

        // Grant creator role if not already granted
        if (!hasRole(CREATOR_ROLE, msg.sender)) {
            _grantRole(CREATOR_ROLE, msg.sender);
        }

        emit StreamRegistered(
            streamId,
            msg.sender,
            title,
            projectedMonthlyRevenue,
            durationMonths
        );

        return streamId;
    }

    /**
     * @dev Tokenize a registered stream
     * @param streamId The stream to tokenize
     * @param tokenizationPercentage Percentage of future royalties to tokenize (in basis points)
     * @return tokenAddress Address of the created cashflow token
     */
    function tokenizeStream(
        uint256 streamId,
        uint256 tokenizationPercentage
    ) external whenNotPaused nonReentrant returns (address) {
        require(streamExists(streamId), "Stream does not exist");
        require(streams[streamId].metadata.creator == msg.sender, "Only creator can tokenize");
        require(!streams[streamId].isTokenized, "Stream already tokenized");
        require(
            tokenizationPercentage > 0 && tokenizationPercentage <= MAX_TOKENIZATION_PERCENTAGE,
            "Invalid tokenization percentage"
        );

        StreamInfo storage stream = streams[streamId];
        
        // Calculate total token supply based on projected revenue
        uint256 totalProjectedRevenue = stream.metadata.projectedMonthlyRevenue * 
                                       stream.metadata.durationMonths;
        uint256 tokenizedRevenue = (totalProjectedRevenue * tokenizationPercentage) / 10000;
        
        // Create cashflow token
        string memory tokenName = string(abi.encodePacked("Cashflow-", stream.metadata.title));
        string memory tokenSymbol = string(abi.encodePacked("CF", _toString(streamId)));
        
        CashflowToken token = new CashflowToken(
            tokenName,
            tokenSymbol,
            tokenizedRevenue, // Total supply equals tokenized revenue
            stream.metadata.durationMonths,
            address(this)
        );

        // Update stream info
        stream.tokenAddress = address(token);
        stream.tokenizationPercentage = tokenizationPercentage;
        stream.totalTokenSupply = tokenizedRevenue;
        stream.isTokenized = true;

        emit StreamTokenized(
            streamId,
            address(token),
            tokenizationPercentage,
            tokenizedRevenue
        );

        return address(token);
    }

    /**
     * @dev Invest in a tokenized stream
     * @param streamId The stream to invest in
     * @param riskAcknowledged Whether investor acknowledges risks
     */
    function investInStream(
        uint256 streamId,
        bool riskAcknowledged
    ) external payable whenNotPaused nonReentrant {
        require(streamExists(streamId), "Stream does not exist");
        require(streams[streamId].isTokenized, "Stream not tokenized");
        require(msg.value >= streams[streamId].metadata.minimumInvestment, "Investment below minimum");
        require(riskAcknowledged, "Must acknowledge investment risks");
        require(
            streams[streamId].metadata.creator != msg.sender,
            "Creator cannot invest in own stream"
        );

        StreamInfo storage stream = streams[streamId];
        CashflowToken token = CashflowToken(stream.tokenAddress);
        
        // Calculate token amount based on investment
        uint256 tokenAmount = msg.value; // 1:1 ratio for simplicity in Phase 1
        require(token.balanceOf(address(this)) >= tokenAmount, "Insufficient tokens available");

        // Transfer upfront capital to creator
        uint256 protocolFeeAmount = (msg.value * protocolFee) / 10000;
        uint256 creatorAmount = msg.value - protocolFeeAmount;
        
        (bool success, ) = stream.metadata.creator.call{value: creatorAmount}("");
        require(success, "Transfer to creator failed");

        // Transfer tokens to investor
        token.transfer(msg.sender, tokenAmount);

        // Record investment
        Investment memory investment = Investment({
            investor: msg.sender,
            amount: msg.value,
            tokenAmount: tokenAmount,
            investedAt: block.timestamp,
            riskAcknowledged: riskAcknowledged
        });

        streamInvestments[streamId].push(investment);

        // Update stream info
        stream.totalInvestment += msg.value;
        if (!hasInvested[streamId][msg.sender]) {
            stream.investorCount++;
            hasInvested[streamId][msg.sender] = true;
            investorStreams[msg.sender].push(streamId);
        }

        // Grant investor role if not already granted
        if (!hasRole(INVESTOR_ROLE, msg.sender)) {
            _grantRole(INVESTOR_ROLE, msg.sender);
        }

        emit InvestmentMade(streamId, msg.sender, msg.value, tokenAmount);
    }

    /**
     * @dev Get stream information
     * @param streamId The stream ID
     * @return StreamInfo struct with all stream data
     */
    function getStreamInfo(uint256 streamId) external view returns (StreamInfo memory) {
        require(streamExists(streamId), "Stream does not exist");
        return streams[streamId];
    }

    /**
     * @dev Get creator's streams
     * @param creator Creator address
     * @return Array of stream IDs
     */
    function getCreatorStreams(address creator) external view returns (uint256[] memory) {
        return creatorStreams[creator];
    }

    /**
     * @dev Get investor's streams
     * @param investor Investor address
     * @return Array of stream IDs
     */
    function getInvestorStreams(address investor) external view returns (uint256[] memory) {
        return investorStreams[investor];
    }

    /**
     * @dev Check if stream exists
     * @param streamId Stream ID to check
     * @return Whether stream exists
     */
    function streamExists(uint256 streamId) public view returns (bool) {
        return streamId > 0 && streamId < _nextStreamId && streams[streamId].metadata.isActive;
    }

    /**
     * @dev Update protocol fee (admin only)
     * @param newFee New protocol fee in basis points
     */
    function updateProtocolFee(uint256 newFee) external onlyRole(ADMIN_ROLE) {
        require(newFee <= MAX_PROTOCOL_FEE, "Fee too high");
        uint256 oldFee = protocolFee;
        protocolFee = newFee;
        emit ProtocolFeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Update minimum investment (admin only)
     * @param newAmount New minimum investment amount
     */
    function updateMinimumInvestment(uint256 newAmount) external onlyRole(ADMIN_ROLE) {
        uint256 oldAmount = minimumInvestment;
        minimumInvestment = newAmount;
        emit MinimumInvestmentUpdated(oldAmount, newAmount);
    }

    /**
     * @dev Emergency pause (admin only)
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause (admin only)
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Withdraw protocol fees (admin only)
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
     * @dev Convert uint256 to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @dev Authorize upgrade (UUPS pattern)
     * @param newImplementation Address of new implementation
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}