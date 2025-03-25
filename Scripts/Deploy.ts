import { ethers, run } from "hardhat";

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
}

  const OrganizationNFTCertificate = await ethers.getContractFactory("OrganizationNFTCertificate");
  
  console.log("Deploying OrganizationNFTCertificate...");
  const nftCertificate = await OrganizationNFTCertificate.deploy();
  await nftCertificate.waitForDeployment();

  console.log("OrganizationNFTCertificate deployed to:", await nftCertificate.getAddress());


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
