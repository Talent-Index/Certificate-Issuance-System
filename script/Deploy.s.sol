// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/CertificateIssuanceSystem.sol";
import "../src/OrganizationNFTCertificate.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy OrganizationNFTCertificate contract first
        OrganizationNFTCertificate nftContract = new OrganizationNFTCertificate();
        console.log("OrganizationNFTCertificate deployed at:", address(nftContract));

        // Deploy CertificateIssuanceSystem contract
        CertificateIssuanceSystem certificateSystem = new CertificateIssuanceSystem();
        console.log("CertificateIssuanceSystem deployed at:", address(certificateSystem));

        vm.stopBroadcast();
    }
}
