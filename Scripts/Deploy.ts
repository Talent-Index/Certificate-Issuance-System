import { ethers, run } from "hardhat";
import { Contract } from "ethers";

async function main() {
  // Compile the contract
  console.log("Compiling contracts...");
  await run("compile");

  // Get the ContractFactory for the CertificateIssuanceSystem contract
  const CertificateIssuanceSystem = await ethers.getContractFactory("CertificateIssuanceSystem");

  // Deploy the contract
  console.log("Deploying the CertificateIssuanceSystem contract...");
  const certificateIssuanceSystem = await CertificateIssuanceSystem.deploy();

  // Wait for the deployment to complete
  await certificateIssuanceSystem.waitForDeployment();

  console.log("CertificateIssuanceSystem deployed to:", await certificateIssuanceSystem.getAddress());

  // Deploy NFT Certificate Contract
  // const OrganizationNFTCertificate = await ethers.getContractFactory("OrganizationNFTCertificate");
  // console.log("Deploying OrganizationNFTCertificate...");
  // const nftCertificate = await OrganizationNFTCertificate.deploy();
  // await nftCertificate.waitForDeployment();
  
  // const nftAddress = await nftCertificate.getAddress();
  // console.log("OrganizationNFTCertificate deployed to:", nftAddress);

//   // Save deployment info
//   console.log("Saving deployment info...");
//   return {
//       OrganizationNFTCertificate: nftAddress
//     };
}

// Execute deployment
main()
  .then((deploymentInfo) => {
    console.log("Deployment completed successfully!");
    console.log(deploymentInfo);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
