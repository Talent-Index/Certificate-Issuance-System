//SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Certificate struct to store metadata
    struct Certificate {
        string recipientName;
        string certificateType;
        uint256 issueDate;
        bool isValid;
        string documentURI; // IPFS hash of the certificate image/PDF
    }

    // Mapping from token ID to Certificate
    mapping(uint256 => Certificate) public certificates;

    // Events
    event CertificateIssued(uint256 indexed tokenId, address recipient, string documentURI);
    event CertificateRevoked(uint256 indexed tokenId);

    constructor() ERC721("AvaCertify", "CERT") {}

    function issueCertificate(
        address recipient,
        string memory recipientName,
        string memory certificateType,
        string memory documentURI,
        string memory metadataURI
    ) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        // Store certificate data
        certificates[newItemId] = Certificate({
            recipientName: recipientName,
            certificateType: certificateType,
            issueDate: block.timestamp,
            isValid: true,
            documentURI: documentURI
        });

        _mint(recipient, newItemId);
        _setTokenURI(newItemId, metadataURI);

        emit CertificateIssued(newItemId, recipient, documentURI);
        return newItemId;
    }

    function revokeCertificate(uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), "Certificate does not exist");
        certificates[tokenId].isValid = false;
        emit CertificateRevoked(tokenId);
    }

    function getCertificate(uint256 tokenId) public view returns (Certificate memory) {
        require(_exists(tokenId), "Certificate does not exist");
        return certificates[tokenId];
    }

    function getDocumentURI(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Certificate does not exist");
        return certificates[tokenId].documentURI;
    }

    function verifyCertificate(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Certificate does not exist");
        return certificates[tokenId].isValid;
    }
}