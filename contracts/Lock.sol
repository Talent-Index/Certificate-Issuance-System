// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CertificateIssuanceSystem is Ownable(address(this)){
    struct Certificate {
        uint256 id;
        string recipientName;
        uint256 issueDate;
        bool isValid;
    }

    event CertificateIssued(uint256 indexed id, string recipientName, uint256 issueDate);
    event CertificateRevoked(uint256 indexed id);
    event CertificateVerified(uint256 indexed id, bool isValid);
    event GasLimitUpdated(uint256 oldLimit, uint256 newLimit);

    uint256 private nextCertificateId;
    mapping(uint256 => Certificate) private certificates;
    uint256 public gasLimit;


    constructor() {
        nextCertificateId = 1; // Start IDs at 1 for better UX
        gasLimit = 0 ; // Set initial gas limit to zero
    }

    function issueCertificate(string memory _recipientName) public onlyOwner {
        uint256 certificateId = nextCertificateId++;
        certificates[certificateId] = Certificate({
            id: certificateId,
            recipientName: _recipientName,
            issueDate: block.timestamp,
            isValid: true
        });

        emit CertificateIssued(certificateId, _recipientName, block.timestamp);
    }

    function verifyCertificate(uint256 _certificateId) public returns (bool) {
        require(certificates[_certificateId].id != 0, "Certificate does not exist.");
        emit CertificateVerified(_certificateId, certificates[_certificateId].isValid);
        return certificates[_certificateId].isValid;
    }

    function revokeCertificate(uint256 _certificateId) public onlyOwner {
        require(certificates[_certificateId].id != 0, "Certificate does not exist.");
        certificates[_certificateId].isValid = false;

        emit CertificateRevoked(_certificateId);
    }

    function getCertificate(uint256 _certificateId) public view returns (Certificate memory) {
        require(certificates[_certificateId].id != 0, "Certificate does not exist.");
        return certificates[_certificateId];
    }

    function setGasLimit(uint256 _newLimit) public onlyOwner {
        emit GasLimitUpdated(gasLimit, _newLimit);
        gasLimit = _newLimit;
    }
}
