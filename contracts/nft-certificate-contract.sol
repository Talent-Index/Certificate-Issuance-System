// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.26;

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/access/AccessControl.sol";
// import "@openzeppelin/contracts/utils/Counters.sol";

// contract OrganizationNFTCertificate is ERC721, ERC721URIStorage, AccessControl {
//     using Counters for Counters.Counter;
//     Counters.Counter private _tokenIds;

//     // Role definition for organizations
//     bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

//     // Struct to store organization branding
//     struct OrganizationBranding {
//         string logoUrl;
//         string brandColor;
//         bool isRegistered;
//     }

//     // Mapping to store organization branding details
//     mapping(address => OrganizationBranding) public organizationBranding;

//     // Events
//     event OrganizationRegistered(address organization, string logoUrl, string brandColor);
//     event CertificateMinted(address organization, address recipient, uint256 tokenId, string tokenURI);

//     constructor() ERC721("OrganizationNFTCertificate", "CERT") {
//         _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
//     }

//     /**
//      * @dev Register organization branding details
//      * @param logoUrl URL to the organization's logo
//      * @param brandColor Organization's brand color code
//      */
//     function registerOrganization(string memory logoUrl, string memory brandColor) external {
//         organizationBranding[msg.sender] = OrganizationBranding({
//             logoUrl: logoUrl,
//             brandColor: brandColor,
//             isRegistered: true
//         });

//         _grantRole(MINTER_ROLE, msg.sender);
//         emit OrganizationRegistered(msg.sender, logoUrl, brandColor);
//     }

//     /**
//      * @dev Mint a new certificate NFT
//      * @param recipient Address to receive the NFT
//      * @param certificateURI URI containing the certificate metadata
//      * @return tokenId The ID of the newly minted NFT
//      */
//     function mintCertificate(address recipient, string memory certificateURI) 
//         external
//         onlyRole(MINTER_ROLE)
//         returns (uint256)
//     {
//         require(organizationBranding[msg.sender].isRegistered, "Organization not registered");
        
//         _tokenIds.increment();
//         uint256 newTokenId = _tokenIds.current();
        
//         _safeMint(recipient, newTokenId);
//         _setTokenURI(newTokenId, certificateURI);
        
//         emit CertificateMinted(msg.sender, recipient, newTokenId, certificateURI);
//         return newTokenId;
//     }

//     /**
//      * @dev Update organization branding
//      * @param logoUrl New logo URL
//      * @param brandColor New brand color
//      */
//     function updateOrganizationBranding(string memory logoUrl, string memory brandColor) 
//         external
//         onlyRole(MINTER_ROLE)
//     {
//         require(organizationBranding[msg.sender].isRegistered, "Organization not registered");
        
//         organizationBranding[msg.sender].logoUrl = logoUrl;
//         organizationBranding[msg.sender].brandColor = brandColor;
        
//         emit OrganizationRegistered(msg.sender, logoUrl, brandColor);
//     }

//     /**
//      * @dev Get organization branding details
//      * @param organization Address of the organization
//      * @return logoUrl The URL of the organization's logo
//      * @return brandColor The organization's brand color
//      * @return isRegistered The registration status of the organization
//      */
//     function getOrganizationBranding(address organization) 
//         external 
//         view 
//         returns (string memory logoUrl, string memory brandColor, bool isRegistered) 
//     {
//         OrganizationBranding memory branding = organizationBranding[organization];
//         return (branding.logoUrl, branding.brandColor, branding.isRegistered);
//     }

//     // Required overrides
//     function supportsInterface(bytes4 interfaceId)
//         public
//         view
//         override(AccessControl, ERC721, ERC721URIStorage)
//         returns (bool)
//     {
//         return super.supportsInterface(interfaceId);
//     }

//     function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
//         super._burn(tokenId);
//     }

//     function tokenURI(uint256 tokenId)
//         public
//         view
//         override(ERC721, ERC721URIStorage)
//         returns (string memory)
//     {
//         return super.tokenURI(tokenId);
//     }
// }
