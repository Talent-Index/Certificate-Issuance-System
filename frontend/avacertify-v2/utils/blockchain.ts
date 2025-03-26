// utils/blockchain.ts
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, AVALANCHE_FUJI_CONFIG } from '../utils/contractConfig';

export interface Certificate {
  id: string
  recipientName: string
  recipientAddress: string
  certificateType: string
  issueDate: string
  expirationDate?: string
  institutionName: string
  status: 'active' | 'revoked'
  additionalDetails?: string
}

export const placeholderCertificates: Certificate[] = []

interface NFTMetadata {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
        trait_type: string;
        value: string;
    }>;
}

type ContractMethodName = 'issueCertificate' | 'getCertificate' | 'revokeCertificate';

interface ContractMethods {
    issueCertificate(recipientName: string): Promise<any>;
    getCertificate(id: string): Promise<any>;
    revokeCertificate(id: string): Promise<any>;
    estimateGas: {
        [key in ContractMethodName]: (...args: any[]) => Promise<number>;
    };
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
            // Request account access
            const accounts = await this.provider.send('eth_requestAccounts', []);

            // Switch to Fuji network
            try {
                if (!window.ethereum) {
                    throw new Error('Ethereum object not found');
                }
                await (window.ethereum as any).request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: AVALANCHE_FUJI_CONFIG.chainId }],
                });
            } catch (switchError: any) {
                // This could be due to the network not existing or the user rejecting the switch
                if (switchError.code === 4902) {
                    try {
                        if (!window.ethereum) {
                            throw new Error('Ethereum object not found');
                        }
                        await (window.ethereum as any).request({
                            method: 'wallet_addEthereumChain',
                            params: [AVALANCHE_FUJI_CONFIG],
                        });
                    } catch (addError) {
                        console.error('Error adding Avalanche Fuji network:', addError);
                        throw new Error('Failed to add Avalanche Fuji network. Please add it manually.');
                    }
                } else if (switchError.code === 4001) {
                    // User rejected the request
                    throw new Error('User rejected network switch. Please switch to Avalanche Fuji manually.');
                } else {
                    console.error('Unexpected error during network switch:', switchError);
                    throw new Error('Failed to switch to Avalanche Fuji network.');
                }
            }

            this.signer = await this.provider.getSigner();
            this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer) as ethers.Contract & ContractMethods;

            return accounts[0];
        } catch (error: any) {
            console.error('Error connecting wallet:', error);
            if (error.code === 4001) {
                throw new Error('User rejected connection request.');
            }
            throw error;
        }
    }
    
    async getContract(): Promise<ethers.Contract> {

        if (!this.contract) {

            if (!this.signer) {

                throw new Error("Wallet not connected");

            }

            this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer) as ethers.Contract & ContractMethods;

        }

        return this.contract;

    }

    private async validateTransaction(method: ContractMethodName, params: any[]): Promise<boolean> {
        if (!this.contract || !this.signer) {
            throw new Error('Contract or signer not initialized');
        }

        try {
            const gasEstimate = await this.contract.estimateGas[method](...params);
            return Number(gasEstimate) > 0;
        } catch (error) {
            console.error('Transaction validation failed:', error);
            return false;
        }
    }

    private async generateMetadata(certificate: Certificate): Promise<NFTMetadata> {
        return {
            name: `Certificate for ${certificate.recipientName}`,
            description: certificate.additionalDetails || "",
            image: "ipfs://your-default-image-cid", // Replace with actual IPFS image
            attributes: [
                { trait_type: "Institution", value: certificate.institutionName },
                { trait_type: "Type", value: certificate.certificateType },
                { trait_type: "Issue Date", value: certificate.issueDate.toString() },
                { trait_type: "Status", value: certificate.status === 'revoked' ? "Revoked" : "Valid" }
            ]
        };
    }

    async issueCertificate(recipientName: string, recipientAddress: string): Promise<string | null> {
        if (!this.contract || !await this.validateTransaction('issueCertificate', [recipientName])) {
            throw new Error('Transaction validation failed');
        }

        try {
            // First issue the certificate
            const tx = await this.contract.issueCertificate(recipientName);
            const receipt = await tx.wait();

            const event = receipt.events?.find((e: { event: string; }) => e.event === 'CertificateIssued');
            if (!event?.args?.id) {
                throw new Error('Certificate issuance failed');
            }

            const certificateId = event.args.id.toString();

            // Then mint the NFT
            const metadata = await this.generateMetadata({
                id: certificateId,
                recipientName,
                recipientAddress,
                certificateType: "Certificate",
                issueDate: Math.floor(Date.now() / 1000).toString(),
                status: 'active',
                institutionName: "Your Institution"
            });

            // Upload metadata to IPFS (implement this)
            const metadataUri = await this.uploadMetadataToIPFS(metadata);

            // Mint NFT with confirmation dialog
            if (window.confirm('Would you like to mint an NFT certificate? This requires an additional transaction.')) {
                const nftTx = await this.contract.mintCertificateNFT(
                    recipientAddress,
                    certificateId,
                    metadataUri
                );
                await nftTx.wait();
            }

            return certificateId;
        } catch (error) {
            console.error('Error in certificate issuance:', error);
            throw error;
        }
    }

    private async uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
        // Implement IPFS upload logic
        // Return IPFS URI
        return `ipfs://your-metadata-cid`;
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
        if (!await this.validateTransaction('getCertificate', [certificateId])) {
            throw new Error('Transaction validation failed - potential security risk');
        }

        try {
            return await this.contract?.getCertificate(certificateId);
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

// Export a singleton instance
export const certificateService = new CertificateService();