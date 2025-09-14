// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CertificateIssuanceSystem
 * @dev A smart contract for issuing, verifying, and managing digital certificates on the blockchain
 * Implements role-based access control and reentrancy protection
 */
contract CertificateIssuanceSystem is AccessControl, ReentrancyGuard {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /**
     * @dev Structure to store certificate information
     * @param id Unique identifier for the certificate
     * @param recipientName Name of the certificate recipient
     * @param issueDate Timestamp when the certificate was issued
     * @param isValid Current validity status of the certificate
     * @param owner Address of the current certificate owner
     */
    struct Certificate {
        uint256 id;
        string recipientName;
        uint256 issueDate;
        bool isValid;
        address owner;
    }

    event CertificateIssued(uint256 indexed id, string recipientName, uint256 issueDate, address owner);
    event CertificateRevoked(uint256 indexed id);
    event CertificateTransferred(uint256 indexed id, address indexed from, address indexed to);

    uint256 private nextCertificateId;
    mapping(uint256 => Certificate) public certificates;

    /**
     * @dev Constructor that sets up initial admin and issuer roles
     * Initializes the certificate ID counter to 1
     */
    constructor() {
        nextCertificateId = 1; // Start IDs at 1 for better UX
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
    }

    /**
     * @dev Issues a new certificate to a recipient
     * @param _recipientName Name of the certificate recipient
     * @param _owner Address that will own the certificate
     * @notice Only accounts with ISSUER_ROLE can call this function
     */
    function issueCertificate(string memory _recipientName, address _owner) public onlyRole(ISSUER_ROLE) nonReentrant {
        uint256 certificateId = nextCertificateId++;
        certificates[certificateId] = Certificate({
            id: certificateId,
            recipientName: _recipientName,
            issueDate: block.timestamp,
            isValid: true,
            owner: _owner
        });

        emit CertificateIssued(certificateId, _recipientName, block.timestamp, _owner);
    }

    /**
     * @dev Verifies if a certificate is valid
     * @param _certificateId ID of the certificate to verify
     * @return bool True if the certificate exists and is valid, reverts if certificate doesn't exist
     */
    function verifyCertificate(uint256 _certificateId) public view returns (bool) {
        require(certificates[_certificateId].id != 0, "Certificate does not exist.");
        return certificates[_certificateId].isValid;
    }

    /**
     * @dev Revokes a certificate, marking it as invalid
     * @param _certificateId ID of the certificate to revoke
     * @notice Only accounts with ISSUER_ROLE can call this function
     */
    function revokeCertificate(uint256 _certificateId) public onlyRole(ISSUER_ROLE) nonReentrant {
        require(certificates[_certificateId].id != 0, "Certificate does not exist.");
        certificates[_certificateId].isValid = false;

        emit CertificateRevoked(_certificateId);
    }

    /**
     * @dev Transfers ownership of a certificate to another address
     * @param _certificateId ID of the certificate to transfer
     * @param _to Address of the new owner
     * @notice Only the current owner can transfer the certificate
     */
    function transferCertificate(uint256 _certificateId, address _to) public nonReentrant {
        require(certificates[_certificateId].id != 0, "Certificate does not exist");
        require(certificates[_certificateId].isValid, "Certificate is not valid");
        require(_to != address(0), "Invalid recipient address");
        require(certificates[_certificateId].owner == msg.sender, "Not the certificate owner");

        certificates[_certificateId].owner = _to;
        emit CertificateTransferred(_certificateId, msg.sender, _to);
    }

    // Admin functions
    /**
     * @dev Adds a new address to the ISSUER_ROLE
     * @param _issuer Address to be granted the ISSUER_ROLE
     * @notice Only accounts with ADMIN_ROLE can call this function
     */
    function addIssuer(address _issuer) public onlyRole(ADMIN_ROLE) nonReentrant {
        grantRole(ISSUER_ROLE, _issuer);
    }

    /**
     * @dev Removes an address from the ISSUER_ROLE
     * @param _issuer Address to be revoked from the ISSUER_ROLE
     * @notice Only accounts with ADMIN_ROLE can call this function
     */
    function removeIssuer(address _issuer) public onlyRole(ADMIN_ROLE) nonReentrant {
        revokeRole(ISSUER_ROLE, _issuer);
    }
}