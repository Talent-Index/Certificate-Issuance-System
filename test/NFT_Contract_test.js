// import { expect } from "chai";
// import { ethers } from "hardhat";
// import { Contract } from "ethers";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// interface OrganizationBranding {
//     logoUrl: string;
//     brandColor: string;
//     isRegistered: boolean;
// }

// interface BlockchainServiceConfig {
//   provider: ethers.Provider;
//   signer: ethers.Signer;
// }

// describe("OrganizationNFTCertificate", function () {
//     let NFTCertificate: Contract;
//     let owner: SignerWithAddress;
//     let organization: SignerWithAddress;
//     let recipient: SignerWithAddress;
//     let addrs: SignerWithAddress[];

//     beforeEach(async function () {
//         [owner, organization, recipient, ...addrs] = await ethers.getSigners();
        
//         const ContractFactory = await ethers.getContractFactory("OrganizationNFTCertificate");
//         NFTCertificate = await ContractFactory.deploy();
//     });

//     describe("Deployment", function () {
//         it("Should set the right owner", async function () {
//             expect(await NFTCertificate.hasRole(await NFTCertificate.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
//         });

//         it("Should have correct name and symbol", async function () {
//             expect(await NFTCertificate.name()).to.equal("OrganizationNFTCertificate");
//             expect(await NFTCertificate.symbol()).to.equal("CERT");
//         });
//     });

//     describe("Organization Registration", () => {
//         const logoUrl = "https://example.com/logo.png";
//         const brandColor = "#FF0000";

//         it("Should register an organization", async () => {
//             await NFTCertificate.connect(organization).registerOrganization(logoUrl, brandColor);

//             const brandingInfo: OrganizationBranding = await NFTCertificate.getOrganizationBranding(organization.address);
//             expect(brandingInfo.logoUrl).to.equal(logoUrl);
//             expect(brandingInfo.brandColor).to.equal(brandColor);
//             expect(brandingInfo.isRegistered).to.equal(true);
//         });

//         it("Should grant MINTER_ROLE to registered organization", async function () {
//             await NFTCertificate.connect(organization).registerOrganization(logoUrl, brandColor);

//             const minterRole = await NFTCertificate.MINTER_ROLE();
//             expect(await NFTCertificate.hasRole(minterRole, organization.address)).to.equal(true);
//         });

//         it("Should emit OrganizationRegistered event", async function () {
//             await expect(NFTCertificate.connect(organization).registerOrganization(logoUrl, brandColor))
//                 .to.emit(NFTCertificate, "OrganizationRegistered")
//                 .withArgs(organization.address, logoUrl, brandColor);
//         });
//     });

//     describe("Certificate Minting", function () {
//         const logoUrl = "https://example.com/logo.png";
//         const brandColor = "#FF0000";
//         const metadataURI = "ipfs://QmExample";

//         beforeEach(async function () {
//             await NFTCertificate.connect(organization).registerOrganization(logoUrl, brandColor);
//         });

//         it("Should mint a certificate", async function () {
//             await NFTCertificate.connect(organization).mintCertificate(recipient.address, metadataURI);

//             expect(await NFTCertificate.balanceOf(recipient.address)).to.equal(1);
//             expect(await NFTCertificate.tokenURI(1)).to.equal(metadataURI);
//         });

//         it("Should emit CertificateMinted event", async function () {
//             await expect(NFTCertificate.connect(organization).mintCertificate(recipient.address, metadataURI))
//                 .to.emit(NFTCertificate, "CertificateMinted")
//                 .withArgs(organization.address, recipient.address, 1, metadataURI);
//         });

//         it("Should not allow unregistered organization to mint", async function () {
//             await expect(
//                 NFTCertificate.connect(addrs[0]).mintCertificate(recipient.address, metadataURI)
//             ).to.be.revertedWith("Organization not registered");
//         });

//         it("Should increment token ID for each mint", async function () {
//             await NFTCertificate.connect(organization).mintCertificate(recipient.address, metadataURI);
//             await NFTCertificate.connect(organization).mintCertificate(recipient.address, metadataURI + "2");

//             expect(await NFTCertificate.tokenURI(1)).to.equal(metadataURI);
//             expect(await NFTCertificate.tokenURI(2)).to.equal(metadataURI + "2");
//         });
//     });

//     describe("Organization Branding Updates", function () {
//         const initialLogoUrl = "https://example.com/logo.png";
//         const initialBrandColor = "#FF0000";
//         const updatedLogoUrl = "https://example.com/new-logo.png";
//         const updatedBrandColor = "#00FF00";

//         beforeEach(async function () {
//             await NFTCertificate.connect(organization).registerOrganization(initialLogoUrl, initialBrandColor);
//         });

//         it("Should update organization branding", async function () {
//             await NFTCertificate.connect(organization).updateOrganizationBranding(updatedLogoUrl, updatedBrandColor);

//             const brandingInfo: OrganizationBranding = await NFTCertificate.getOrganizationBranding(organization.address);
//             expect(brandingInfo.logoUrl).to.equal(updatedLogoUrl);
//             expect(brandingInfo.brandColor).to.equal(updatedBrandColor);
//         });

//         it("Should emit OrganizationRegistered event on update", async function () {
//             await expect(NFTCertificate.connect(organization).updateOrganizationBranding(updatedLogoUrl, updatedBrandColor))
//                 .to.emit(NFTCertificate, "OrganizationRegistered")
//                 .withArgs(organization.address, updatedLogoUrl, updatedBrandColor);
//         });

//         it("Should not allow unregistered organization to update branding", async function () {
//             await expect(
//                 NFTCertificate.connect(addrs[0]).updateOrganizationBranding(updatedLogoUrl, updatedBrandColor)
//             ).to.be.revertedWith("Organization not registered");
//         });
//     });
// });

// describe("BlockchainService", () => {
//   let service: BlockchainServiceConfig;
//   let mockProvider: ethers.Provider;
//   let mockSigner: ethers.Signer;

//   beforeEach(async () => {
//     [mockSigner] = await ethers.getSigners();
//     mockProvider = ethers.provider;
    
//     service = {
//       provider: mockProvider,
//       signer: mockSigner
//     };
//   });

//   it("should connect to wallet successfully", async () => {
//     const address = await mockSigner.getAddress();
//     expect(address).to.match(/0x[0-9a-fA-F]{40}/);
//   });

//   it("should handle network switch", async () => {
//     const network = await mockProvider.getNetwork();
//     expect(network.chainId).to.be.greaterThan(0);
//   });
// });