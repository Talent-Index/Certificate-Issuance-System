// utils/blockchain.ts
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, AVALANCHE_FUJI_CONFIG, NFT_CERTIFICATE_ADDRESS, NFT_CERTIFICATE_ABI } from '../utils/contractConfig';
import { IPFSService } from '@/utils/ipfsService';

export interface Certificate {
  id: string;
  certificateId?: string;
  transactionHash?: string;
  recipientName: string;
  recipientAddress: string;
  certificateType: string;
  issueDate: string;
  expirationDate?: string;
  institutionName: string;
  status: 'active' | 'revoked';
  additionalDetails?: string;
}

export const placeholderCertificates: Certificate[] = [];

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string }>;
}

type ContractMethodName = 'issueCertificate' | 'getCertificate' | 'revokeCertificate' | 'mintCertificate';

interface ContractMethods {
  issueCertificate(recipientName: string, recipientAddress: string): Promise<any>;
  getCertificate(id: string): Promise<any>;
  revokeCertificate(id: string): Promise<any>;
  mintCertificate(recipient: string, uri: string): Promise<any>;
  estimateGas: { [key in ContractMethodName]: (...args: any[]) => Promise<number> };
}

export class CertificateService {
  private provider: ethers.BrowserProvider | null = null;
  private contract: (ethers.Contract & ContractMethods) | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    }
  }

  async init(): Promise<void> {
    if (!this.provider) {
      throw new Error('No provider available');
    }
    try {
      await this.provider.send('eth_requestAccounts', []);
    } catch (error) {
      console.error('Failed to initialize provider:', error);
      throw error;
    }
  }


async connectWallet(): Promise<string> {
    if (!this.provider) {
      throw new Error('Please install MetaMask');
    }
    try {
      const accounts = await this.provider.send('eth_requestAccounts', []);
      try {
        await (window.ethereum as any).request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: AVALANCHE_FUJI_CONFIG.chainId }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await (window.ethereum as any).request({
              method: 'wallet_addEthereumChain',
              params: [AVALANCHE_FUJI_CONFIG],
            });
          } catch (addError) {
            throw new Error('Failed to add Avalanche Fuji network. Please add it manually.');
          }
        } else if (switchError.code === 4001) {
          throw new Error('User rejected network switch. Please switch to Avalanche Fuji manually.');
        } else {
          throw new Error('Failed to switch to Avalanche Fuji network.');
        }
      }
      this.signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        this.signer,
      ) as ethers.Contract & ContractMethods;
      return accounts[0];
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      throw new Error(error.message || 'Failed to connect wallet');
    }
  }

  async getContract(): Promise<ethers.Contract & ContractMethods> {
    if (!this.contract) {
      if (!this.signer) {
        await this.connectWallet();
      }
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        this.signer,
      ) as ethers.Contract & ContractMethods;
    }
    return this.contract;
  }

  private async validateConnection(): Promise<void> {
    if (!this.contract || !this.signer) {
      await this.getContract();
      if (!this.contract || !this.signer) {
        throw new Error('Contract or signer not initialized. Please connect your wallet.');
      }
    }
  }

  async issueCertificate(recipientName: string, recipientAddress: string): Promise<string | null> {
    await this.validateConnection();
    try {
      const gasEstimate = await this.contract!.estimateGas.issueCertificate(recipientName, recipientAddress);
      // ethers v6: pass overrides as the last argument, but only if all method arguments are provided
      const tx = await (this.contract! as any).issueCertificate(
        recipientName,
        recipientAddress,
        { gasLimit: Math.ceil(Number(gasEstimate) * 1.2) }
      );
      const receipt = await tx.wait();
      let certificateId = null;
      for (const log of receipt.logs) {
        const parsedLog = this.contract!.interface.parseLog(log);
        if (parsedLog?.name === 'CertificateIssued') {
          certificateId = parsedLog.args.id.toString();
          break;
        }
      }
      if (!certificateId) {
        throw new Error('Failed to retrieve certificate ID from transaction');
      }
      return certificateId;
    } catch (error: any) {
      console.error('Error in certificate issuance:', error);
      throw new Error(error.message || 'Failed to issue certificate');
    }
  }
  private async generateMetadata(certificate: Certificate): Promise<NFTMetadata> {
    return {
      name: `Certificate for ${certificate.recipientName}`,
      description: certificate.additionalDetails || `${certificate.certificateType} certificate issued by ${certificate.institutionName}`,
      image: "ipfs://your-default-image-cid",
      attributes: [
        { trait_type: "Institution", value: certificate.institutionName },
        { trait_type: "Type", value: certificate.certificateType },
        { trait_type: "Issue Date", value: certificate.issueDate },
        { trait_type: "Status", value: certificate.status === 'revoked' ? "Revoked" : "Valid" },
      ],
    };
  }

  async mintNFTCertificate(recipientAddress: string, metadataUri: string): Promise<string | null> {
    await this.validateConnection();
    try {
      const nftContract = new ethers.Contract(
        NFT_CERTIFICATE_ADDRESS,
        NFT_CERTIFICATE_ABI,
        this.signer,
      ) as ethers.Contract;
      // Use 'as any' to bypass TypeScript type error for dynamic contract methods
      const gasEstimate = await (nftContract.estimateGas as any).mintCertificate(recipientAddress, metadataUri);
      const tx = await (nftContract as any).mintCertificate(recipientAddress, metadataUri, {
        gasLimit: Math.ceil(Number(gasEstimate) * 1.2),
      });
      const receipt = await tx.wait();
      let tokenId = null;
      for (const log of receipt.logs) {
        if (log.address.toLowerCase() === NFT_CERTIFICATE_ADDRESS.toLowerCase()) {
          const parsedLog = nftContract.interface.parseLog(log);
          if (parsedLog?.name === 'CertificateMinted') {
            tokenId = parsedLog.args.tokenId.toString();
            break;
          }
        }
      }
      return tokenId;
    } catch (error) {
      console.error('Error minting NFT certificate:', error);
      throw error;
    }
  }

  private async uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
    try {
      const ipfsService = new IPFSService();
      const metadataHash = await ipfsService.uploadJSON(metadata);
      return ipfsService.getGatewayUrl(metadataHash);
    } catch (error) {
      console.error('Failed to upload metadata to IPFS:', error);
      throw new Error('IPFS upload failed');
    }
  }

  async verifyCertificate(certificateId: string): Promise<boolean | null> {
    if (!this.contract) {
      console.warn('Contract not initialized');
      return null;
    }
    try {
      return await this.contract.verifyCertificate(certificateId);
    } catch (error) {
      console.error('Error verifying certificate:', error);
      return null;
    }
  }

  async revokeCertificate(certificateId: string): Promise<void | null> {
    if (!this.contract) {
      console.warn('Contract not initialized');
      return null;
    }
    try {
      const tx = await this.contract.revokeCertificate(certificateId);
      await tx.wait();
      return;
    } catch (error) {
      console.error('Error revoking certificate:', error);
      return null;
    }
  }

  async getCertificate(certificateId: string): Promise<Certificate | null> {
    await this.validateConnection();
    try {
      const certificate = await this.contract!.certificates(certificateId);
      if (!certificate) {
        return null;
      }
      return {
        id: certificate.id.toString(),
        recipientName: certificate.recipientName,
        recipientAddress: certificate.owner,
        certificateType: "Certificate",
        issueDate: new Date(Number(certificate.issueDate) * 1000).toISOString(),
        institutionName: "AvaCertify",
        status: certificate.isValid ? 'active' : 'revoked',
      };
    } catch (error) {
      console.error('Error getting certificate:', error);
      return null;
    }
  }

  async getConnectedAddress(): Promise<string | null> {
    if (!this.signer) {
      console.warn('Wallet not connected');
      return null;
    }
    try {
      return await this.signer.getAddress();
    } catch (error) {
      console.error('Error getting address:', error);
      return null;
    }
  }
}

export const certificateService = new CertificateService();