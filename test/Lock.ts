import { expect } from "chai";
import { ethers } from "hardhat";
import { CertificateIssuanceSystem } from "../typechain-types"; // Update the path as per your setup

describe("CertificateIssuanceSystem", function () {
  let certificateContract: any;
  let owner: any;
  let user: any;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    
    const CertificateSystem = await ethers.getContractFactory("CertificateIssuanceSystem");
    certificateContract = await CertificateSystem.deploy();
  });

  it("should initialize with a gas limit of zero", async function () {
    const gasLimit = await certificateContract.gasLimit();
    expect(gasLimit).to.equal(0);
  });

  it("should allow the owner to update the gas limit", async function () {
    await certificateContract.connect(owner).setGasLimit(50000); // Set gas limit to 50000
    const updatedGasLimit = await certificateContract.gasLimit();
    expect(updatedGasLimit).to.equal(50000);
  });

  it("should emit an event when the gas limit is updated", async function () {
    await expect(certificateContract.connect(owner).setGasLimit(100000))
      .to.emit(certificateContract, "GasLimitUpdated")
      .withArgs(0, 100000); // Check for old and new limits in the event
  });

  it("should issue a certificate when gas limit conditions are met", async function () {
    await certificateContract.connect(owner).setGasLimit(1000); // Set a minimal gas limit
    await certificateContract.connect(owner).issueCertificate("Alice");
    const cert = await certificateContract.getCertificate(1);
    expect(cert.recipientName).to.equal("Alice");
    expect(cert.isValid).to.be.true;
  });

  it("should fail to issue a certificate if gas left is below the gas limit", async function () {
    await certificateContract.connect(owner).setGasLimit(1000000000); // Set an unrealistically high gas limit
    await expect(certificateContract.connect(owner).issueCertificate("Bob")).to.be.revertedWith(
      "Insufficient gas for operation."
    );
  });

  it("should verify a certificate", async function () {
    await certificateContract.connect(owner).issueCertificate("Charlie");
    const isValid = await certificateContract.verifyCertificate(1);
    expect(isValid).to.be.true;
  });

  it("should fail to verify a certificate if gas left is below the gas limit", async function () {
    await certificateContract.connect(owner).setGasLimit(1000000000); // Set an unrealistically high gas limit
    await expect(certificateContract.verifyCertificate(1)).to.be.revertedWith(
      "Insufficient gas for operation."
    );
  });

  it("should revoke a certificate when gas limit conditions are met", async function () {
    await certificateContract.connect(owner).issueCertificate("David");
    await certificateContract.connect(owner).revokeCertificate(1);
    const cert = await certificateContract.getCertificate(1);
    expect(cert.isValid).to.be.false;
  });

  it("should fail to revoke a certificate if gas left is below the gas limit", async function () {
    await certificateContract.connect(owner).setGasLimit(1000000000); // Set an unrealistically high gas limit
    await expect(certificateContract.revokeCertificate(1)).to.be.revertedWith(
      "Insufficient gas for operation."
    );
  });

  it("should emit events when issuing, verifying, or revoking certificates", async function () {
    // Issue event
    await expect(certificateContract.connect(owner).issueCertificate("Eve"))
      .to.emit(certificateContract, "CertificateIssued")
      .withArgs(1, "Eve", await ethers.provider.getBlockNumber());

    // Verify event
    await expect(certificateContract.verifyCertificate(1))
      .to.emit(certificateContract, "CertificateVerified")
      .withArgs(1, true);

    // Revoke event
    await expect(certificateContract.connect(owner).revokeCertificate(1))
      .to.emit(certificateContract, "CertificateRevoked")
      .withArgs(1);
  });
});
