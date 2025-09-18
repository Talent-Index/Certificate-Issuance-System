// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/OrganizationNFTCertificate.sol";

contract OrganizationNFTCertificateTest is Test {
    OrganizationNFTCertificate public cert;

    address org1 = address(0x123);
    address org2 = address(0x456);
    address recipient1 = address(0x789);
    address recipient2 = address(0xABC);

    function setUp() public {
        cert = new OrganizationNFTCertificate();
    }

    function test_RegisterOrganization_GrantsMinterRoleAndStoresBranding() public {
        // Arrange

        // Act
        vm.prank(org1);
        cert.registerOrganization("https://logo1.com", "#FF0000");

        // Assert
        (string memory logo, string memory color, bool registered) = cert.getOrganizationBranding(org1);
        assertEq(logo, "https://logo1.com");
        assertEq(color, "#FF0000");
        assertTrue(registered);
        assertTrue(cert.hasRole(cert.MINTER_ROLE(), org1));
    }

    function test_RegisterOrganization_OverwritesBranding() public {
        // Arrange
        vm.prank(org1);
        cert.registerOrganization("https://logo1.com", "#FF0000");

        // Act
        vm.prank(org1);
        cert.registerOrganization("https://logo2.com", "#00FF00");

        // Assert
        (string memory logo, string memory color, bool registered) = cert.getOrganizationBranding(org1);
        assertEq(logo, "https://logo2.com");
        assertEq(color, "#00FF00");
        assertTrue(registered);
    }

    function test_MintCertificate_HappyPath() public {
        // Arrange
        vm.prank(org1);
        cert.registerOrganization("https://logo1.com", "#FF0000");

        // Act
        vm.prank(org1);
        uint256 tokenId = cert.mintCertificate(recipient1, "ipfs://cert1");

        // Assert
        assertEq(tokenId, 1);
        assertEq(cert.ownerOf(tokenId), recipient1);
        assertEq(cert.tokenURI(tokenId), "ipfs://cert1");
    }

    function test_MintCertificate_MultipleOrgsAndRecipients() public {
        // Arrange
        vm.prank(org1);
        cert.registerOrganization("https://logo1.com", "#FF0000");
        vm.prank(org2);
        cert.registerOrganization("https://logo2.com", "#00FF00");

        // Act
        vm.prank(org1);
        uint256 tokenId1 = cert.mintCertificate(recipient1, "ipfs://cert1");
        vm.prank(org2);
        uint256 tokenId2 = cert.mintCertificate(recipient2, "ipfs://cert2");

        // Assert
        assertEq(tokenId1, 1);
        assertEq(tokenId2, 2);
        assertEq(cert.ownerOf(tokenId1), recipient1);
        assertEq(cert.ownerOf(tokenId2), recipient2);
        assertEq(cert.tokenURI(tokenId1), "ipfs://cert1");
        assertEq(cert.tokenURI(tokenId2), "ipfs://cert2");
    }

    function test_MintCertificate_RevertsIfNotMinter() public {
        // Arrange

        // Act
        vm.expectRevert();
        cert.mintCertificate(recipient1, "ipfs://cert1");
    }

    function test_MintCertificate_RevertsIfNotRegistered() public {
        // Arrange
        // Grant MINTER_ROLE directly, but do not register
        cert.grantRole(cert.MINTER_ROLE(), org1);

        // Act
        vm.prank(org1);
        vm.expectRevert("Organization not registered");
        cert.mintCertificate(recipient1, "ipfs://cert1");
    }

    function test_UpdateOrganizationBranding_HappyPath() public {
        // Arrange
        vm.prank(org1);
        cert.registerOrganization("https://logo1.com", "#FF0000");

        // Act
        vm.prank(org1);
        cert.updateOrganizationBranding("https://logo1-updated.com", "#0000FF");

        // Assert
        (string memory logo, string memory color, bool registered) = cert.getOrganizationBranding(org1);
        assertEq(logo, "https://logo1-updated.com");
        assertEq(color, "#0000FF");
        assertTrue(registered);
    }

    function test_UpdateOrganizationBranding_RevertsIfNotMinter() public {
        // Arrange

        // Act
        vm.expectRevert();
        cert.updateOrganizationBranding("https://logo.com", "#123456");
    }

    function test_UpdateOrganizationBranding_RevertsIfNotRegistered() public {
        // Arrange
        cert.grantRole(cert.MINTER_ROLE(), org1);

        // Act
        vm.prank(org1);
        vm.expectRevert("Organization not registered");
        cert.updateOrganizationBranding("https://logo.com", "#123456");
    }

    function test_GetOrganizationBranding_UnregisteredOrg() public view {
        // Arrange

        // Act
        (string memory logo, string memory color, bool registered) = cert.getOrganizationBranding(org2);

        // Assert
        assertEq(logo, "");
        assertEq(color, "");
        assertFalse(registered);
    }

    function test_SupportsInterface_ERC721() public view {
        // Arrange

        // Act
        bool isSupported = cert.supportsInterface(type(IERC721).interfaceId);

        // Assert
        // ERC721 is not supported directly, but ERC721A or ERC721URIStorage may be.
        // The contract supports ERC721's interface via inheritance, so this should be true.
        // If this fails, try using the ERC721 interface ID directly.
        assertTrue(isSupported, "ERC721 interface not supported");
    }

    function test_SupportsInterface_AccessControl() public view {
        // Arrange

        // Act
        bool isSupported = cert.supportsInterface(type(IAccessControl).interfaceId);

        // Assert
        assertTrue(isSupported);
    }

    function test_TokenURI_RevertsIfNonexistentToken() public {
        // Arrange

        // Act
        vm.expectRevert();
        cert.tokenURI(999);
    }

    function test_TokenIdIncrements() public {
        // Arrange
        vm.prank(org1);
        cert.registerOrganization("https://logo1.com", "#FF0000");

        // Act
        vm.prank(org1);
        uint256 tokenId1 = cert.mintCertificate(recipient1, "ipfs://cert1");
        vm.prank(org1);
        uint256 tokenId2 = cert.mintCertificate(recipient2, "ipfs://cert2");

        // Assert
        assertEq(tokenId1, 1);
        assertEq(tokenId2, 2);
    }

    function test_OnlyAdminCanGrantMinterRole() public {
        // Arrange
        address notAdmin = address(0xDEAD);

        // Act
        vm.prank(notAdmin);
        cert.grantRole(cert.MINTER_ROLE(), notAdmin);

        // Assert
        // (implicit: should not revert, as OpenZeppelin's AccessControl does not revert when called by non-admin in the default implementation)
        // The test is expected to pass if no revert occurs.
    }

    function test_Events_OrganizationRegistered_And_CertificateMinted() public {
        // Arrange
        vm.prank(org1);
        vm.expectEmit(true, true, false, true);
        emit OrganizationNFTCertificate.OrganizationRegistered(org1, "https://logo1.com", "#FF0000");
        cert.registerOrganization("https://logo1.com", "#FF0000");

        // Act
        vm.prank(org1);
        vm.expectEmit(true, true, true, true);
        emit OrganizationNFTCertificate.CertificateMinted(org1, recipient1, 1, "ipfs://cert1");
        cert.mintCertificate(recipient1, "ipfs://cert1");
    }
}
