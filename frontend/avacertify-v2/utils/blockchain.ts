// utils/blockchain.ts
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, NFT_CERTIFICATE_ADDRESS, NFT_CERTIFICATE_ABI } from '../utils/contractConfig';
import { IPFSService } from '@/utils/ipfsService';

const AVALANCHE_FUJI_CONFIG = {
  chainId: '0xA869', // 43113
  chainName: 'Avalanche Fuji C-Chain',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io/'],
};

// Define Window interface augmentation for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

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

interface ContractMethods {
  issueCertificate(_recipientName: string, _recipientAddress: string): Promise<unknown>;
  getCertificate(_id: string): Promise<unknown>;
  revokeCertificate(_id: string): Promise<unknown>;
  mintCertificate(_recipient: string, _uri: string): Promise<unknown>;
  estimateGas: { 
    issueCertificate: (...args: unknown[]) => Promise<bigint>;
    mintCertificate: (...args: unknown[]) => Promise<bigint>;
   };
}

// Define a combined type for your contract
type CertificateContract = ethers.Contract & ContractMethods;

export class CertificateService {
    getConnectedAddress() {
        throw new Error('Method not implemented.');
    }
  getProvider(): ethers.BrowserProvider {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }
    return this.provider;
  }
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: CertificateContract | null = null;

  /**
   * Creates a new CertificateService instance and initializes the provider if available.
   */
  constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    }
  }

private async initialize(): Promise<void> {
    if (this.provider) {
        const network = await this.provider.getNetwork();
        const targetChainId = BigInt(AVALANCHE_FUJI_CONFIG.chainId);
        
        if (network.chainId !== targetChainId) {
            try {
                await this.provider.send('wallet_switchEthereumChain', [{ 
                    chainId: AVALANCHE_FUJI_CONFIG.chainId 
                }]);
            } catch (switchError: unknown) {
                // Handle network switching errors with proper type checking
                const error = switchError as { code?: number };
                if (error?.code === 4902) {
                    try {
                        await window.ethereum?.request({
                            method: 'wallet_addEthereumChain',
                            params: [AVALANCHE_FUJI_CONFIG],
                        } as const);
                    } catch (_addError) {
                        throw new Error('Failed to add Avalanche Fuji network. Please add it manually.');
                    }
                } else if (error?.code === 4001) {
                    throw new Error('User rejected network switch. Please switch to Avalanche Fuji manually.');
                } else {
                    throw new Error('Failed to switch to Avalanche Fuji network.');
                }
            }
        }
        

        this.signer = await this.provider.getSigner();
        this.contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            this.signer
        ) as CertificateContract;
    }
}

  /**
   * Initializes the provider by requesting account access from the user's wallet.
   *
   * Raises:
   *   Error: If no provider is available or the user rejects the connection.
   */
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


  /**
   * Connects the user's wallet and ensures the Avalanche Fuji network is selected.
   * This function requests account access, switches to the correct network, and initializes the contract and signer.
   *
   * Args:
   *   None
   * Returns:
   *   A promise that resolves to the connected wallet address as a string.
   * Raises:
   *   Error: If MetaMask is not installed, the user rejects the connection, or network switching fails.
   */
  async connectWallet(): Promise<string> {
    if (!this.provider) {
      throw new Error('Please install MetaMask');
    }
    try {
      const accounts = await this.provider.send('eth_requestAccounts', []);
      try {
        await (window.ethereum as NonNullable<Window['ethereum']>).request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: AVALANCHE_FUJI_CONFIG.chainId }],
        });
      } catch (switchError: unknown) {
        if ((switchError as { code?: number })?.code === 4902) {
          try {
            await (window.ethereum as NonNullable<Window['ethereum']>).request({
              method: 'wallet_addEthereumChain',
              params: [AVALANCHE_FUJI_CONFIG],
            });
          } catch (addError: unknown) {
            console.error("Failed to add network:", addError);
            throw new Error('Failed to add Avalanche Fuji network. Please add it manually.');
          }
        } else if ((switchError as { code?: number })?.code === 4001) {
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
      ) as CertificateContract;
      return accounts[0];
    } catch (error: unknown) {
      console.error('Error connecting wallet:', error);
      throw new Error((error as Error).message || 'Failed to connect wallet');
    }
  }

  /**
   * Returns the contract instance, initializing it if necessary.
   * Ensures the provider and signer are available and connected before returning the contract.
   *
   * Args:
   *   None
   * Returns:
   *   A promise that resolves to the ethers.Contract instance.
   * Raises:
   *   Error: If the wallet is not connected or the provider is unavailable.
   */
  async getContract(): Promise<CertificateContract> {
    if (this.contract) {
      return this.contract;
    }

    // ensure provider exists in browser environments
    if (!this.provider && typeof window !== "undefined" && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    }

    // ensure signer (will prompt wallet if necessary)
    if (!this.signer) {
      try {
        await this.connectWallet();
      } catch (_err) {
        throw new Error("Wallet not connected. Call certificateService.connectWallet() first.");
      }
    }

    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer) as CertificateContract;
    return this.contract;
  }

  /**
   * Validates that the contract and signer are initialized
   * Attempts to initialize them if they're not
   * @throws Error if initialization fails
   */
  private async validateConnection(): Promise<void> {
    if (!this.contract || !this.signer) {
      await this.getContract();
      if (!this.contract || !this.signer) {
        throw new Error('Contract or signer not initialized. Please connect your wallet.');
      }
    }
  }

  /**
   * Issues a new certificate on the blockchain
   * @param recipientName Name of the certificate recipient
   * @param recipientAddress Blockchain address of the recipient
   * @returns Promise resolving to the certificate ID if successful, null otherwise
   * @throws Error if the transaction fails
   */
  async issueCertificate(recipientName: string, recipientAddress: string): Promise<string | null> {
    await this.validateConnection();
    try {
      const gasEstimate = await (this.contract!.estimateGas as unknown as { issueCertificate: (...args: unknown[]) => Promise<bigint> }).issueCertificate(recipientName, recipientAddress);
      // ethers v6: pass overrides as the last argument, but only if all method arguments are provided
      const tx = await (this.contract as unknown as { issueCertificate: (...args: unknown[]) => Promise<ethers.ContractTransactionResponse> }).issueCertificate(
        recipientName,
        recipientAddress,
        { gasLimit: gasEstimate + (gasEstimate / 2n) }
      );
      const receipt = await tx.wait();
      let certificateId = null;
      for (const log of receipt?.logs ?? []) {
        try {
        const parsedLog = this.contract!.interface.parseLog(log);
        if (parsedLog?.name === 'CertificateIssued') {
          certificateId = parsedLog.args.id.toString();
          break;
        }
      } catch {
        // Ignore errors from logs that don't match the contract interface
        }
      }
      if (!certificateId) {
        throw new Error('Failed to retrieve certificate ID from transaction');
      }
      return certificateId;
    } catch (error: unknown) {
      console.error('Error in certificate issuance:', error);
      throw new Error((error as Error).message || 'Failed to issue certificate');
    }
  }
  /**
   * Generates NFT metadata from a certificate
   * @param certificate Certificate object containing all necessary information
   * @returns Promise resolving to NFT metadata object
   */
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

    /**
   * Mints an NFT certificate for the specified recipient and metadata URI.
   * This function interacts with the NFT contract to mint a new certificate token and returns the token ID.
   *
   * Args:
   *   recipientAddress: The address of the recipient who will receive the NFT certificate.
   *   metadataUri: The URI pointing to the certificate's metadata on IPFS.
   * Returns:
   *   A promise that resolves to the minted token ID as a string, or null if not found.
   * Raises:
   *   Error: If the minting transaction fails or the token ID cannot be retrieved.
   */
  async mintNFTCertificate(recipientAddress: string, metadataUri: string): Promise<string | null> {
    await this.validateConnection();
    try {
      const nftContract = new ethers.Contract(
        NFT_CERTIFICATE_ADDRESS,
        NFT_CERTIFICATE_ABI,
        this.signer,
      ) as ethers.Contract;
      // Use 'as any' to bypass TypeScript type error for dynamic contract methods
      const gasEstimate = await (nftContract.estimateGas as unknown as { mintCertificate: (...args: unknown[]) => Promise<bigint> }).mintCertificate(recipientAddress, metadataUri);
      const tx = await (nftContract as unknown as { mintCertificate: (...args: unknown[]) => Promise<ethers.ContractTransactionResponse> }).mintCertificate(recipientAddress, metadataUri, {
        gasLimit: gasEstimate + (gasEstimate / 2n),
      });
      const receipt = await tx.wait();
      let tokenId = null;
      for (const log of receipt?.logs ?? []) {
        if (log.address.toLowerCase() === NFT_CERTIFICATE_ADDRESS.toLowerCase()) {
          try {
            const parsedLog = nftContract.interface.parseLog(log);
            if (parsedLog?.name === 'CertificateMinted') {
              tokenId = parsedLog.args.tokenId.toString();
              break;
            }
          } catch {
            // Ignore errors from logs that don't match the contract interface
          }
        }
      }
      return tokenId;
    } catch (error: unknown) {
      console.error('Error minting NFT certificate:', error);
      throw new Error((error as Error).message || 'Failed to mint NFT certificate');
    }
  }

  /**
   * Uploads NFT metadata to IPFS
   * @param metadata NFT metadata object to upload
   * @returns Promise resolving to the IPFS gateway URL
   * @throws Error if IPFS upload fails
   */
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

  /**
   * Verifies a certificate's validity on the blockchain
   * @param certificateId ID of the certificate to verify
   * @returns Promise resolving to true if valid, false if invalid, null if error
   */
  async verifyCertificate(certificateId: string): Promise<boolean | null> {
    await this.validateConnection();
    try {
      return await (this.contract as unknown as { verifyCertificate: (id: string) => Promise<boolean> }).verifyCertificate(certificateId);
    } catch (error) {
      console.error('Error verifying certificate:', error);
      return null;
    }
  }

  /**
   * Revokes a certificate on the blockchain
   * @param certificateId ID of the certificate to revoke
   * @returns Promise resolving to void if successful, null if failed
   */
  async revokeCertificate(certificateId: string): Promise<void | null> {
    await this.validateConnection();
    try {
      const tx = await (this.contract as unknown as { revokeCertificate: (id: string) => Promise<ethers.ContractTransactionResponse> }).revokeCertificate(certificateId);
      await tx.wait();
      return;
    } catch (error) {
      console.error('Error revoking certificate:', error);
      return null;
    }
  }

  /**
   * Retrieves certificate information from the blockchain
   * @param certificateId ID of the certificate to retrieve
   * @returns Promise resolving to Certificate object if found, null if not found or error
   */
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

  /**
   * Transfers a certificate to a new recipient
   * @param certificateId ID of the certificate to transfer
   * @param newRecipientAddress Address of the new recipient
   * @returns Promise resolving to true if successful, false if failed
   */
  async transferCertificate(certificateId: string, newRecipientAddress: string): Promise<boolean> {
    await this.validateConnection();
    try {
      const tx = await (this.contract as unknown as { transferCertificate: (id: string, recipient: string) => Promise<ethers.ContractTransactionResponse> }).transferCertificate(certificateId, newRecipientAddress);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error transferring certificate:', error);
      return false;
    }
  }
}

export const certificateService = new CertificateService();

