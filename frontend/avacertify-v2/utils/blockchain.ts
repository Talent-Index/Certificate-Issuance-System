// utils/blockchain.ts
import { ethers } from "ethers";
import { CERTIFICATE_SYSTEM_ADDRESS, NFT_CERTIFICATE_ADDRESS, CERTIFICATE_SYSTEM_ABI, NFT_CERTIFICATE_ABI, AVALANCHE_FUJI_CONFIG } from "./contractConfig";

export interface Certificate {
  id: string;
  certificateId?: string;
  recipientName: string;
  recipientAddress: string;
  certificateType: string;
  issueDate: string;
  expirationDate?: string;
  institutionName: string;
  status: "active" | "revoked";
  additionalDetails?: string;
  transactionHash?: string;
  documentHash?: string;
  documentUrl?: string;
  isNFT?: boolean;
}

export const placeholderCertificates: Certificate[] = [];

interface ContractMethods {
  issueCertificate(recipientName: string, recipientAddress: string): Promise<ethers.ContractTransactionResponse>;
  getCertificate(id: string): Promise<any>;
  verifyCertificate(id: string): Promise<boolean>;
  revokeCertificate(id: string): Promise<ethers.ContractTransactionResponse>;
  certificates(id: string): Promise<any>;
  transferCertificate(certificateId: string, to: string): Promise<ethers.ContractTransactionResponse>;
  // estimateGas: {
  //   issueCertificate(recipientName: string, recipientAddress: string): Promise<bigint>;
  // };
  interface: ethers.Interface;
}

interface NFTContractMethods {
  mintCertificate(recipient: string, certificateURI: string): Promise<ethers.ContractTransactionResponse>;
  getOrganizationBranding(organization: string): Promise<[string, string, boolean]>;
  registerOrganization(logoUrl: string, brandColor: string): Promise<ethers.ContractTransactionResponse>;
}

declare global {
  interface Window {
    ethereum?: {
      request(args: { method: string; params?: any[] }): Promise<any>;
      isMetaMask?: boolean;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      addEventListener?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
      removeEventListener?: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

export class CertificateService {
  private provider: ethers.BrowserProvider | null = null;
  private contract: (ethers.Contract & ContractMethods) | null = null;
  private nftContract: (ethers.Contract & NFTContractMethods) | null = null;
  private signer: ethers.Signer | null = null;
  private isInitialized: boolean = false;
  private isConnecting: boolean = false;

  constructor() {}

  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (typeof window === "undefined" || !window.ethereum) {
      console.warn("No Web3 provider found");
      return;
    }

    try {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.isInitialized = true;
      console.log("✅ Provider initialized");
    } catch (error) {
      console.error("❌ Failed to initialize provider:", error);
      throw new Error("Failed to initialize wallet connection");
    }
  }

  private async validateConnection(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("Service not initialized. Call init() first.");
    }
    if (!this.provider) {
      throw new Error("No provider available");
    }
    if (!this.signer || !this.contract || !this.nftContract) {
      throw new Error("Wallet not connected");
    }
  }

  async switchToFujiNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error("No Web3 provider available");
    }
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: AVALANCHE_FUJI_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [AVALANCHE_FUJI_CONFIG],
        });
      } else {
        throw switchError;
      }
    }
  }

  async connectWallet(): Promise<string> {
    if (this.isConnecting) {
      throw new Error("Connection already in progress. Please wait.");
    }

    if (!window.ethereum) {
      throw new Error("Please install MetaMask or Core Wallet");
    }

    this.isConnecting = true;

    try {
      console.log("🔌 Connecting wallet...");
      this.provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await this.provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock your wallet.");
      }

      console.log("✅ Account connected:", accounts[0]);
      await this.switchToFujiNetwork();

      console.log("🔑 Getting signer...");
      this.signer = await this.provider.getSigner();
      const signerAddress = await this.signer.getAddress();
      console.log("✅ Signer obtained:", signerAddress);

      this.contract = new ethers.Contract(
        CERTIFICATE_SYSTEM_ADDRESS,
        CERTIFICATE_SYSTEM_ABI,
        this.signer
      ) as ethers.Contract & ContractMethods;

      this.nftContract = new ethers.Contract(
        NFT_CERTIFICATE_ADDRESS,
        NFT_CERTIFICATE_ABI,
        this.signer
      ) as ethers.Contract & NFTContractMethods;

      console.log("✅ Contracts initialized");

      // Handle event listeners with fallback
      if (window.ethereum) {
        const listenerMethod = window.ethereum.on || window.ethereum.addEventListener;
        if (typeof listenerMethod === "function") {
          try {
            listenerMethod.call(window.ethereum, "accountsChanged", this.handleAccountsChanged.bind(this));
            listenerMethod.call(window.ethereum, "chainChanged", this.handleChainChanged.bind(this));
            console.log("✅ Event listeners registered");
          } catch (error) {
            console.warn("⚠️ Failed to register event listeners:", error);
            console.warn("Event listeners are not critical for core functionality. Continuing without them.");
          }
        } else {
          console.warn("⚠️ Event listener method not available. Events will not be monitored.");
        }
      } else {
        console.warn("⚠️ No Ethereum provider available for event listeners.");
      }

      return accounts[0];
    } catch (error: any) {
      console.error("❌ Connection error:", error);
      this.signer = null;
      this.contract = null;
      this.nftContract = null;
      
      if (error.code === 4001) {
        throw new Error("User rejected the connection request");
      } else if (error.code === -32002) {
        throw new Error("Wallet connection already pending. Please check your wallet");
      } else if (error.code === -32603) {
        throw new Error("Internal wallet error. Please try again");
      } else if (error.message?.includes("network")) {
        throw new Error("Please connect to Avalanche Fuji Testnet");
      }
      
      throw new Error(error.message || "Failed to connect wallet");
    } finally {
      this.isConnecting = false;
    }
  }

  private async handleAccountsChanged(accounts: string[]): Promise<void> {
    try {
      if (accounts.length === 0) {
        this.signer = null;
        this.contract = null;
        this.nftContract = null;
        console.log("🔌 No accounts connected");
      } else {
        this.signer = await this.provider!.getSigner();
        this.contract = new ethers.Contract(
          CERTIFICATE_SYSTEM_ADDRESS,
          CERTIFICATE_SYSTEM_ABI,
          this.signer
        ) as ethers.Contract & ContractMethods;
        this.nftContract = new ethers.Contract(
          NFT_CERTIFICATE_ADDRESS,
          NFT_CERTIFICATE_ABI,
          this.signer
        ) as ethers.Contract & NFTContractMethods;
        console.log("✅ Accounts updated:", accounts[0]);
      }
    } catch (error) {
      console.error("❌ Error handling accounts changed:", error);
    }
  }

  private async handleChainChanged(): Promise<void> {
    try {
      this.signer = null;
      this.contract = null;
      this.nftContract = null;
      await this.init();
      console.log("✅ Chain changed, reinitialized");
    } catch (error) {
      console.error("❌ Error handling chain changed:", error);
    }
  }

  async hasIssuerRole(): Promise<boolean> {
    await this.validateConnection();
    const address = await this.getConnectedAddress();
    if (!address) {
      return false;
    }
    try {
      // Get both roles
      const ISSUER_ROLE = await this.contract!.ISSUER_ROLE();
      const ADMIN_ROLE = await this.contract!.ADMIN_ROLE(); 
      
      const hasIssuer = await this.contract!.hasRole(ISSUER_ROLE, address);
      const hasAdmin = await this.contract!.hasRole(ADMIN_ROLE, address);
      
      console.log(`Role check for ${address}: ISSUER_ROLE=${hasIssuer}, ADMIN_ROLE=${hasAdmin}`);
      return hasIssuer || hasAdmin; // Admin inherits issuer permissions
    } catch (error) {
      console.error("Error checking roles:", error);
      return false;
    }
  }

  async issueCertificate(recipientName: string, recipientAddress: string): Promise<string> {
    await this.validateConnection();
    if (!recipientName?.trim() || !recipientAddress?.trim()) {
      throw new Error("Recipient name and address are required");
    }
    if (!ethers.isAddress(recipientAddress)) {
      throw new Error("Invalid recipient address");
    }
    if (recipientName.length > 100) {
      throw new Error("Recipient name too long (max 100 characters)");
    }

    try {
      console.log("📜 === Issuing Certificate ===");
      console.log("Recipient Name:", recipientName);
      console.log("Recipient Address:", recipientAddress);

      const hasRole = await this.hasIssuerRole();
      if (!hasRole) {
        throw new Error("Wallet does not have ISSUER_ROLE. Contact admin to grant role.");
      }

      // const gasEstimate = await this.contract!.estimateGas.issueCertificate(recipientName, recipientAddress).catch((error) => {
      //   console.error("Gas estimation failed:", error);
      //   throw new Error("Failed to estimate gas. Possible reasons: insufficient funds or unauthorized issuer.");
      // });

      // const balance = await this.provider!.getBalance(await this.signer!.getAddress());
      // if (balance < gasEstimate * BigInt(1e9)) {
      //   throw new Error("Insufficient AVAX for gas fees. Get test AVAX from faucet.");
      // }

      const tx = await this.contract!.issueCertificate(recipientName, recipientAddress);
      const receipt = await tx.wait();
      if (!receipt) {
        throw new Error("Transaction failed");
      }

      let certificateId: string | undefined;
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.contract!.interface.parseLog({
            topics: [...log.topics],
            data: log.data,
          });
          if (parsedLog && parsedLog.name === "CertificateIssued") {
            certificateId = parsedLog.args.id.toString();
            console.log("🎉 Certificate ID:", certificateId);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!certificateId) {
        throw new Error("Failed to retrieve certificate ID");
      }

      console.log("✅ === Certificate Issuance Complete ===");
      return certificateId;
    } catch (error: any) {
      console.error("❌ === Certificate Issuance Failed ===");
      console.error("Error:", error);
      if (error.code === "ACTION_REJECTED" || error.code === 4001) {
        throw new Error("Transaction was rejected by user");
      } else if (error.code === "INSUFFICIENT_FUNDS" || error.message?.includes("insufficient funds")) {
        throw new Error("Insufficient AVAX for gas fees. Get test AVAX from faucet.");
      } else if (error.code === "NETWORK_ERROR" || error.message?.includes("network")) {
        throw new Error("Network error. Please check connection and ensure Avalanche Fuji Testnet.");
      } else if (error.code === "CALL_EXCEPTION") {
        throw new Error("Transaction failed: Likely unauthorized issuer or invalid parameters.");
      } else if (error.message?.includes("not authorized") || error.message?.includes("ISSUER_ROLE")) {
        throw new Error("Wallet does not have ISSUER_ROLE. Contact admin to grant role.");
      }
      throw new Error(error.reason || error.message || "Failed to issue certificate");
    }
  }

  async mintNFTCertificate(recipient: string, certificateURI: string): Promise<string> {
    await this.validateConnection();
    if (!recipient?.trim() || !certificateURI?.trim()) {
      throw new Error("Recipient address and certificate URI are required");
    }
    if (!ethers.isAddress(recipient)) {
      throw new Error("Invalid recipient address");
    }

    try {
      console.log("📜 === Minting NFT Certificate ===");
      console.log("Recipient:", recipient);
      console.log("Certificate URI:", certificateURI);

      const tx = await this.nftContract!.mintCertificate(recipient, certificateURI);
      const receipt = await tx.wait();
      if (!receipt) {
        throw new Error("Transaction failed");
      }

      let tokenId: string | undefined;
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.nftContract!.interface.parseLog({
            topics: [...log.topics],
            data: log.data,
          });
          if (parsedLog && parsedLog.name === "CertificateMinted") {
            tokenId = parsedLog.args.tokenId.toString();
            console.log("🎉 Token ID:", tokenId);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!tokenId) {
        throw new Error("Failed to retrieve token ID");
      }

      console.log("✅ === NFT Certificate Minting Complete ===");
      return tokenId;
    } catch (error: any) {
      console.error("❌ === NFT Certificate Minting Failed ===");
      console.error("Error:", error);
      if (error.code === "ACTION_REJECTED") {
        throw new Error("Transaction was rejected by user");
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        throw new Error("Insufficient funds for gas fees");
      } else if (error.code === "NETWORK_ERROR") {
        throw new Error("Network error. Please check connection.");
      } else if (error.message?.includes("not registered")) {
        throw new Error("Organization not registered. Please register first.");
      }
      throw new Error(error.reason || error.message || "Failed to mint NFT certificate");
    }
  }

  async registerOrganization(logoUrl: string, brandColor: string): Promise<void> {
    await this.validateConnection();
    if (!logoUrl?.trim() || !brandColor?.trim()) {
      throw new Error("Logo URL and brand color are required");
    }

    try {
      console.log("🏢 === Registering Organization ===");
      const tx = await this.nftContract!.registerOrganization(logoUrl, brandColor);
      await tx.wait();
      console.log("✅ === Organization Registration Complete ===");
    } catch (error: any) {
      console.error("❌ === Organization Registration Failed ===");
      console.error("Error:", error);
      throw new Error(error.reason || error.message || "Failed to register organization");
    }
  }

  async verifyCertificate(certificateId: string, isNFT: boolean = false): Promise<boolean> {
    await this.validateConnection();
    if (!certificateId?.trim()) {
      throw new Error("Certificate ID is required");
    }

    try {
      if (isNFT) {
        const owner = await this.nftContract!.ownerOf(certificateId);
        return owner !== ethers.ZeroAddress;
      } else {
        const isValid = await this.contract!.verifyCertificate(certificateId);
        return Boolean(isValid);
      }
    } catch (error: any) {
      console.error("Error verifying certificate:", error);
      throw new Error("Failed to verify certificate");
    }
  }

  async revokeCertificate(certificateId: string): Promise<string> {
    await this.validateConnection();
    if (!certificateId?.trim()) {
      throw new Error("Certificate ID is required");
    }

    try {
      const hasRole = await this.hasIssuerRole();
      if (!hasRole) {
        throw new Error("Wallet does not have ISSUER_ROLE. Contact admin to grant role.");
      }

      const tx = await this.contract!.revokeCertificate(certificateId);
      const receipt = await tx.wait();
      if (!receipt) {
        throw new Error("Transaction failed");
      }
      return receipt.hash;
    } catch (error: any) {
      console.error("Error revoking certificate:", error);
      if (error.code === "ACTION_REJECTED") {
        throw new Error("Transaction was rejected by user");
      }
      throw new Error(error.reason || error.message || "Failed to revoke certificate");
    }
  }

  async getCertificate(certificateId: string, isNFT: boolean = false): Promise<Certificate | null> {
    await this.validateConnection();
    if (!certificateId?.trim()) {
      throw new Error("Certificate ID is required");
    }

    try {
      const storedCertificates = JSON.parse(localStorage.getItem("certificates") || "[]") as Certificate[];
      const storedCert = storedCertificates.find((cert) => cert.id === certificateId && cert.isNFT === isNFT);

      if (isNFT) {
        const owner = await this.nftContract!.ownerOf(certificateId);
        if (owner === ethers.ZeroAddress) {
          return null;
        }
        const tokenURI = await this.nftContract!.tokenURI(certificateId);
        return {
          id: certificateId,
          certificateId,
          recipientName: storedCert?.recipientName || "Unknown",
          recipientAddress: owner,
          certificateType: storedCert?.certificateType || "NFT Certificate",
          issueDate: storedCert?.issueDate || new Date().toISOString(),
          institutionName: storedCert?.institutionName || "AvaCertify",
          status: "active",
          transactionHash: storedCert?.transactionHash,
          documentHash: storedCert?.documentHash,
          documentUrl: storedCert?.documentUrl,
          isNFT: true,
        };
      } else {
        const certificate = await this.contract!.certificates(certificateId);
        if (!certificate || certificate.id === 0) {
          return null;
        }
        return {
          id: certificate.id.toString(),
          certificateId: certificate.id.toString(),
          recipientName: certificate.recipientName,
          recipientAddress: certificate.owner,
          certificateType: storedCert?.certificateType || "Certificate",
          issueDate: new Date(Number(certificate.issueDate) * 1000).toISOString(),
          institutionName: storedCert?.institutionName || "AvaCertify",
          status: certificate.isValid ? "active" : "revoked",
          transactionHash: storedCert?.transactionHash,
          documentHash: storedCert?.documentHash,
          documentUrl: storedCert?.documentUrl,
          isNFT: false,
        };
      }
    } catch (error: any) {
      console.error("Error getting certificate:", error);
      throw new Error("Failed to retrieve certificate");
    }
  }

  async getConnectedAddress(): Promise<string | null> {
    if (!this.signer) {
      return null;
    }
    try {
      return await this.signer.getAddress();
    } catch (error) {
      console.error("Error getting address:", error);
      return null;
    }
  }

  async isOrganizationRegistered(): Promise<boolean> {
    await this.validateConnection();
    const address = await this.getConnectedAddress();
    if (!address) {
      return false;
    }
    const [, , isRegistered] = await this.nftContract!.getOrganizationBranding(address);
    return isRegistered;
  }

  async getContract(): Promise<ethers.Contract & ContractMethods> {
    await this.validateConnection();
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }
    return this.contract;
  }

  async getNFTContract(): Promise<ethers.Contract & NFTContractMethods> {
    await this.validateConnection();
    if (!this.nftContract) {
      throw new Error("NFT Contract not initialized");
    }
    return this.nftContract;
  }

  isConnected(): boolean {
    return this.signer !== null && this.contract !== null && this.nftContract !== null;
  }

  async getNetwork(): Promise<ethers.Network | null> {
    if (!this.provider) {
      return null;
    }
    try {
      return await this.provider.getNetwork();
    } catch (error) {
      console.error("Error getting network:", error);
      return null;
    }
  }

  /**
   * Transfers a certificate (on-chain) to another address.
   * Returns true when the transaction succeeds, false otherwise.
   */
  async transferCertificate(certificateId: string, to: string): Promise<boolean> {
    await this.validateConnection();
    if (!certificateId?.trim()) {
      throw new Error("Certificate ID is required");
    }
    if (!to?.trim() || !ethers.isAddress(to)) {
      throw new Error("Invalid recipient address");
    }

    try {
      const tx = await this.contract!.transferCertificate(certificateId, to);
      const receipt = await tx.wait();
      return !!receipt;
    } catch (error: any) {
      console.error("Error transferring certificate:", error);
      return false;
    }
  }
}

export const certificateService = new CertificateService();