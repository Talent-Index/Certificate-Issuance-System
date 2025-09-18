// CertificateIssuanceSystemTest.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import "../src/CertificateIssuanceSystem.sol";
import "forge-std/Test.sol";

contract CertificateIssuanceSystemTest is Test {
    CertificateIssuanceSystem public cert;

    function setUp() public {
        cert = new CertificateIssuanceSystem();
    }

    function testIssueCertificate() public {
        cert.issueCertificate("Alice", address(0x123));
        (, string memory name,, bool isValid, address owner) = cert.certificates(1);
        assertEq(name, "Alice");
        assertEq(owner, address(0x123));
        assertTrue(isValid);
    }

    // Add more tests for revoke, transfer, verify, etc.

    function testRevokeCertificate() public {
        cert.issueCertificate("Alice", address(0x123));
        cert.revokeCertificate(1);
        (, string memory name,, bool isValid, address owner) = cert.certificates(1);
        assertEq(name, "Alice");
        assertEq(owner, address(0x123));
        assertFalse(isValid);
    }

    function testTransferCertificate() public {
        cert.issueCertificate("Alice", address(0x123));
        vm.prank(address(0x123));
        cert.transferCertificate(1, address(0x456));
        (, string memory name,, bool isValid, address owner) = cert.certificates(1);
        assertEq(name, "Alice");
        assertEq(owner, address(0x456));
        assertTrue(isValid);
    }

    function testVerifyCertificate() public {
        cert.issueCertificate("Alice", address(0x123));
        bool isValid = cert.verifyCertificate(1);
        assertTrue(isValid);
    }

    function test_RevertIfIssueCertificateUnauthorized() public {
        vm.prank(address(0x999));
        vm.expectRevert();
        cert.issueCertificate("Bob", address(0x123));
    }

    function test_RevertWhenRevokeNonExistentCertificate() public {
        vm.expectRevert("Certificate does not exist.");
        cert.revokeCertificate(999); // Non-existent certificate ID
    }

    function test_RevertWhenTransferNotOwner() public {
        cert.issueCertificate("Alice", address(0x123));
        vm.prank(address(0x999)); // Simulate call from non-owner
        vm.expectRevert("Not the certificate owner");
        cert.transferCertificate(1, address(0x456));
    }

    function test_RevertWhenVerifyNonExistentCertificate() public {
        vm.expectRevert("Certificate does not exist.");
        cert.verifyCertificate(999); // Non-existent certificate ID
    }

    function test_RevertWhenTransferToZeroAddress() public {
        cert.issueCertificate("Alice", address(0x123));
        vm.prank(address(0x123)); // Simulate call from current owner
        vm.expectRevert("Invalid recipient address");
        cert.transferCertificate(1, address(0));
    }
    // Add more edge case tests as needed
}