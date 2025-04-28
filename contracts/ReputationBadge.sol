// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ReputationBadge
 * @dev Dynamic NFT badges that evolve based on freelancer achievements
 */
contract ReputationBadge is ERC721URIStorage, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIds;
    address public gigEscrowAddress;
    
    // Badge types
    enum BadgeType { 
        COMPLETED_GIGS,      // Based on number of completed gigs
        EARNINGS_MILESTONE,  // Based on total earnings
        STREAK,              // Based on consecutive completed gigs
        DISPUTE_FREE,        // For freelancers with no disputes
        SPECIAL,             // Special achievements
        INITIATIVE           // For taking initiative - awarded to all users who join the platform
    }

    struct Badge {
        BadgeType badgeType;
        uint256 level;       // Current level of the badge
        address owner;       // Freelancer who owns the badge
        uint256 value;       // Value associated (e.g. number of gigs, amount earned)
        uint256 timestamp;   // When it was minted/last updated
    }

    // Mapping from token ID to Badge
    mapping(uint256 => Badge) public badges;
    
    // Map address -> badgeType -> tokenId to prevent multiple badges of same type
    mapping(address => mapping(BadgeType => uint256)) public userBadges;
    
    // Thresholds for badge levels
    mapping(BadgeType => uint256[]) public levelThresholds;

    // Base URIs for different badge types and levels
    mapping(BadgeType => mapping(uint256 => string)) public badgeURIs;

    event BadgeMinted(address indexed owner, uint256 indexed tokenId, BadgeType badgeType, uint256 level);
    event BadgeUpgraded(address indexed owner, uint256 indexed tokenId, BadgeType badgeType, uint256 oldLevel, uint256 newLevel);
    event BadgeURISet(BadgeType badgeType, uint256 level, string uri);

    modifier onlyGigEscrow() {
        require(msg.sender == gigEscrowAddress, "ReputationBadge: Only GigEscrow contract can call this");
        _;
    }

    constructor(address _initialOwner) ERC721("SecureLance Reputation Badge", "SLRB") Ownable(_initialOwner) {
        // Initialize level thresholds
        
        // Completed Gigs thresholds: 5, 15, 30, 50, 100
        levelThresholds[BadgeType.COMPLETED_GIGS] = [5, 15, 30, 50, 100];
        
        // Earnings thresholds in wei: 1 ETH, 5 ETH, 10 ETH, 25 ETH, 50 ETH
        levelThresholds[BadgeType.EARNINGS_MILESTONE] = [
            1 ether,
            5 ether,
            10 ether,
            25 ether,
            50 ether
        ];
        
        // Streak thresholds: 3, 5, 10, 15, 20
        levelThresholds[BadgeType.STREAK] = [3, 5, 10, 15, 20];
        
        // Dispute-free thresholds: 5, 15, 25, 40, 60
        levelThresholds[BadgeType.DISPUTE_FREE] = [5, 15, 25, 40, 60];
        
        // Special badges only have one level
        levelThresholds[BadgeType.SPECIAL] = [1];
        
        // Initiative badge - awarded to all users, has just one level
        levelThresholds[BadgeType.INITIATIVE] = [1];
    }

    function setGigEscrowAddress(address _gigEscrow) external onlyOwner {
        gigEscrowAddress = _gigEscrow;
    }

    function setBadgeURI(BadgeType badgeType, uint256 level, string memory uri) external onlyOwner {
        badgeURIs[badgeType][level] = uri;
        emit BadgeURISet(badgeType, level, uri);
    }

    function mintBadge(
        address to,
        BadgeType badgeType,
        uint256 value
    ) external onlyGigEscrow returns (uint256) {
        // Check if the user already has this badge type
        uint256 existingBadgeId = userBadges[to][badgeType];
        
        if (existingBadgeId > 0) {
            // If badge exists, potentially upgrade it
            return _upgradeBadgeIfEligible(existingBadgeId, value);
        } else {
            // Calculate the level based on thresholds
            uint256 level = _calculateLevel(badgeType, value);
            
            if (level > 0) {
                // Mint a new badge
                _tokenIds.increment();
                uint256 newTokenId = _tokenIds.current();
                
                _mint(to, newTokenId);
                _setTokenURI(newTokenId, badgeURIs[badgeType][level]);
                
                badges[newTokenId] = Badge({
                    badgeType: badgeType,
                    level: level,
                    owner: to,
                    value: value,
                    timestamp: block.timestamp
                });
                
                userBadges[to][badgeType] = newTokenId;
                
                emit BadgeMinted(to, newTokenId, badgeType, level);
                return newTokenId;
            }
        }
        
        return 0; // No badge minted
    }
    
    function _upgradeBadgeIfEligible(
        uint256 tokenId,
        uint256 newValue
    ) internal returns (uint256) {
        Badge storage badge = badges[tokenId];
        BadgeType badgeType = badge.badgeType;
        
        // Update the value
        badge.value = newValue;
        
        // Calculate new level based on new value
        uint256 newLevel = _calculateLevel(badgeType, newValue);
        
        if (newLevel > badge.level) {
            // Upgrade the badge
            uint256 oldLevel = badge.level;
            badge.level = newLevel;
            badge.timestamp = block.timestamp;
            
            // Update the token URI to the new level's URI
            _setTokenURI(tokenId, badgeURIs[badgeType][newLevel]);
            
            emit BadgeUpgraded(badge.owner, tokenId, badgeType, oldLevel, newLevel);
        }
        
        return tokenId;
    }
    
    function _calculateLevel(BadgeType badgeType, uint256 value) internal view returns (uint256) {
        uint256[] memory thresholds = levelThresholds[badgeType];
        
        for (uint256 i = thresholds.length; i > 0; i--) {
            if (value >= thresholds[i - 1]) {
                return i; // Level starts at 1
            }
        }
        
        return 0; // Not eligible for a badge yet
    }
    
    function getBadgeDetails(uint256 tokenId) external view returns (Badge memory) {
        require(_exists(tokenId), "Badge does not exist");
        return badges[tokenId];
    }

    function getUserBadge(address user, BadgeType badgeType) external view returns (uint256) {
        return userBadges[user][badgeType];
    }

    // Required overrides for ERC721 extensions
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
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    // New function to check if a user has the initiative badge and mint it if not
    function mintInitiativeBadge(address to) external onlyGigEscrow returns (uint256) {
        // Check if the user already has an initiative badge
        uint256 existingBadgeId = userBadges[to][BadgeType.INITIATIVE];
        
        if (existingBadgeId > 0) {
            // User already has the badge, return its ID
            return existingBadgeId;
        } else {
            // Mint a new initiative badge (always level 1)
            _tokenIds.increment();
            uint256 newTokenId = _tokenIds.current();
            
            _mint(to, newTokenId);
            _setTokenURI(newTokenId, badgeURIs[BadgeType.INITIATIVE][1]);
            
            badges[newTokenId] = Badge({
                badgeType: BadgeType.INITIATIVE,
                level: 1,
                owner: to,
                value: 1,
                timestamp: block.timestamp
            });
            
            userBadges[to][BadgeType.INITIATIVE] = newTokenId;
            
            emit BadgeMinted(to, newTokenId, BadgeType.INITIATIVE, 1);
            return newTokenId;
        }
    }
}