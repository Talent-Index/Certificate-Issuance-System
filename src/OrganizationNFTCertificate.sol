// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title OrganizationNFTCertificate
 * @dev A smart contract for organizations to issue NFT certificates with their own branding
 * Combines ERC721 standard with AccessControl for permissioned minting
 */
contract OrganizationNFTCertificate is ERC721, ERC721URIStorage, AccessControl {
    uint256 private _nextTokenId = 1;

    // Role definition for organizations
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Struct to store organization branding
    struct OrganizationBranding {
        string logoUrl;
        string brandColor;
        bool isRegistered;
    }

    // Mapping to store organization branding details
    mapping(address => OrganizationBranding) public organizationBranding;

    // Events
    event OrganizationRegistered(address organization, string logoUrl, string brandColor);
    event CertificateMinted(address organization, address recipient, uint256 tokenId, string tokenURI);

    /**
     * @dev Constructor initializes the NFT collection with name and symbol
     * Grants DEFAULT_ADMIN_ROLE to the contract deployer
     */
    constructor() ERC721("OrganizationNFTCertificate", "CERT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Register organization branding details
     * @param logoUrl URL to the organization's logo
     * @param brandColor Organization's brand color code
     */
    function registerOrganization(string memory logoUrl, string memory brandColor) external {
        organizationBranding[msg.sender] = OrganizationBranding({
            logoUrl: logoUrl,
            brandColor: brandColor,
            isRegistered: true
        });

        _grantRole(MINTER_ROLE, msg.sender);
        emit OrganizationRegistered(msg.sender, logoUrl, brandColor);
    }

    /**
     * @dev Mint a new certificate NFT
     * @param recipient Address to receive the NFT
     * @param certificateURI URI containing the certificate metadata
     * @return tokenId The ID of the newly minted NFT
     */
    function mintCertificate(address recipient, string memory certificateURI) 
        external
        onlyRole(MINTER_ROLE)
        returns (uint256)
    {
        require(organizationBranding[msg.sender].isRegistered, "Organization not registered");
        
        uint256 newTokenId = _nextTokenId++;
        
        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, certificateURI);
        
        emit CertificateMinted(msg.sender, recipient, newTokenId, certificateURI);
        return newTokenId;
    }

    /**
     * @dev Update organization branding
     * @param logoUrl New logo URL
     * @param brandColor New brand color
     */
    function updateOrganizationBranding(string memory logoUrl, string memory brandColor) 
        external
        onlyRole(MINTER_ROLE)
    {
        require(organizationBranding[msg.sender].isRegistered, "Organization not registered");
        
        organizationBranding[msg.sender].logoUrl = logoUrl;
        organizationBranding[msg.sender].brandColor = brandColor;
        
        emit OrganizationRegistered(msg.sender, logoUrl, brandColor);
    }

    /**
     * @dev Get organization branding details
     * @param organization Address of the organization
     * @return logoUrl The URL of the organization's logo
     * @return brandColor The organization's brand color
     * @return isRegistered The registration status of the organization
     */
    function getOrganizationBranding(address organization) 
        external 
        view 
        returns (string memory logoUrl, string memory brandColor, bool isRegistered) 
    {
        OrganizationBranding memory branding = organizationBranding[organization];
        return (branding.logoUrl, branding.brandColor, branding.isRegistered);
    }

    // Required overrides
    /**
     * @dev Determines if the contract implements the specified interface
     * @param interfaceId The interface identifier, as specified in ERC-165
     * @return bool True if the contract implements interfaceId, false otherwise
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl, ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Returns the URI for a given token ID
     * @param tokenId The ID of the token to query
     * @return string The URI of the token metadata
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
