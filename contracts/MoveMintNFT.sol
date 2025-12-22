// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MoveMintNFT
 * @dev ERC721 NFT contract for minting dance performances with IP-style metadata
 * @notice This contract serves as a standalone NFT registry on Mantle Testnet
 * Features:
 * - ERC721 standard with enumeration and URI storage
 * - ERC2981 royalty support
 * - Decentralized minting (caller-based, no admin minting)
 * - Rich metadata storage for dance performances
 * - IPFS integration for off-chain metadata
 */
contract MoveMintNFT is ERC721, ERC721URIStorage, ERC721Enumerable, ERC2981, Ownable {
    // Token ID counter (replaces deprecated Counters)
    uint256 private _nextTokenId;

    // Struct to store dance performance metadata
    struct DanceMetadata {
        string title;
        string danceStyle;
        string choreographer;
        uint256 duration; // in seconds
        string ipfsMetadataHash; // Full IPFS hash (e.g., "QmXxx...")
        address creator;
        uint256 mintedAt;
    }

    // Mapping from token ID to dance metadata
    mapping(uint256 => DanceMetadata) public danceMetadata;

    // Mapping from creator address to their minted token IDs
    mapping(address => uint256[]) public creatorTokens;

    // Events
    event DanceMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string title,
        string danceStyle,
        string ipfsMetadataHash
    );

    event RoyaltyUpdated(uint256 indexed tokenId, address receiver, uint96 feeNumerator);

    /**
     * @dev Constructor initializes the NFT collection
     * @param _royaltyReceiver Default royalty receiver address
     * @param _royaltyFeeNumerator Royalty fee in basis points (e.g., 500 = 5%)
     */
    constructor(
        address _royaltyReceiver,
        uint96 _royaltyFeeNumerator
    ) ERC721("MoveMint Dance NFT", "DANCE") Ownable(msg.sender) {
        // Set default royalty for all tokens
        _setDefaultRoyalty(_royaltyReceiver, _royaltyFeeNumerator);
        // Initialize token counter
        _nextTokenId = 0;
    }

    /**
     * @dev Mint a new dance performance NFT
     * @param title Title of the dance performance
     * @param danceStyle Style/genre of the dance
     * @param choreographer Name of the choreographer
     * @param duration Duration of the performance in seconds
     * @param ipfsMetadataHash IPFS hash containing full metadata JSON
     * @return tokenId The ID of the newly minted token
     */
    function mintDance(
        string memory title,
        string memory danceStyle,
        string memory choreographer,
        uint256 duration,
        string memory ipfsMetadataHash
    ) public returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(ipfsMetadataHash).length > 0, "IPFS hash cannot be empty");
        require(duration > 0, "Duration must be greater than 0");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        // Mint NFT to the caller
        _safeMint(msg.sender, tokenId);

        // Store metadata
        danceMetadata[tokenId] = DanceMetadata({
            title: title,
            danceStyle: danceStyle,
            choreographer: choreographer,
            duration: duration,
            ipfsMetadataHash: ipfsMetadataHash,
            creator: msg.sender,
            mintedAt: block.timestamp
        });

        // Set token URI to IPFS gateway
        string memory uri = string(abi.encodePacked("ipfs://", ipfsMetadataHash));
        _setTokenURI(tokenId, uri);

        // Track creator's tokens
        creatorTokens[msg.sender].push(tokenId);

        // Emit event
        emit DanceMinted(tokenId, msg.sender, title, danceStyle, ipfsMetadataHash);

        return tokenId;
    }

    /**
     * @dev Get all token IDs minted by a specific creator
     * @param creator Address of the creator
     * @return Array of token IDs
     */
    function getCreatorTokens(address creator) public view returns (uint256[] memory) {
        return creatorTokens[creator];
    }

    /**
     * @dev Get dance metadata for a specific token
     * @param tokenId The token ID to query
     * @return DanceMetadata struct containing all metadata
     */
    function getDanceMetadata(uint256 tokenId) public view returns (DanceMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return danceMetadata[tokenId];
    }

    /**
     * @dev Update royalty for a specific token (only token owner)
     * @param tokenId The token ID
     * @param receiver Royalty receiver address
     * @param feeNumerator Royalty fee in basis points
     */
    function setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 feeNumerator
    ) public {
        require(ownerOf(tokenId) == msg.sender, "Only token owner can set royalty");
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
        emit RoyaltyUpdated(tokenId, receiver, feeNumerator);
    }

    /**
     * @dev Update default royalty (only contract owner)
     * @param receiver Royalty receiver address
     * @param feeNumerator Royalty fee in basis points
     */
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) public onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    /**
     * @dev Get total number of minted tokens
     * @return Total supply
     */
    function getTotalMinted() public view returns (uint256) {
        return _nextTokenId;
    }

    // Required overrides for multiple inheritance

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
