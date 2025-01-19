// utils/contractinteraction.tsx
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, AVALANCHE_FUJI_CONFIG } from '../utils/contractConfig';

export interface Certificate {
    id: number;
    recipientName: string;
    issueDate: number;
    isValid: boolean;
}

export class CertificateService {
    private provider: ethers.providers.Web3Provider | null = null;
    private contract: ethers.Contract | null = null;
    private signer: ethers.Signer | null = null;

    constructor() {
        if (typeof window !== 'undefined' && window.ethereum) {
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
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
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: AVALANCHE_FUJI_CONFIG.chainId }],
                });
            } catch (switchError: any) {
                // Add the network if it doesn't exist
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [AVALANCHE_FUJI_CONFIG],
                    });
                }
            }

            this.signer = this.provider.getSigner();
            this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);

            return accounts[0];
        } catch (error) {
            console.error('Error connecting wallet:', error);
            throw error;
        }
    }

    async issueCertificate(recipientName: string): Promise<string> {
        if (!this.contract) {
          throw new Error('Contract not initialized');
        }

        try {
            const tx = await this.contract.issueCertificate(recipientName);
            const receipt = await tx.wait();

            // Get certificate ID from events
            const event = receipt.events?.find((e: { event: string; }) => e.event === 'CertificateIssued');
            return event?.args?.id.toString() || '';
        } catch (error) {
            console.error('Error issuing certificate:', error);
            throw error;
        }
    }

    async verifyCertificate(certificateId: string): Promise<boolean> {
        if (!this.contract) {
          throw new Error('Contract not initialized');
        }

        try {
            return await this.contract.verifyCertificate(certificateId);
        } catch (error) {
            console.error('Error verifying certificate:', error);
            throw error;
        }
    }

    async revokeCertificate(certificateId: string): Promise<void> {
        if (!this.contract) {
          throw new Error('Contract not initialized');
        }

        try {
            const tx = await this.contract.revokeCertificate(certificateId);
            await tx.wait();
        } catch (error) {
            console.error('Error revoking certificate:', error);
            throw error;
        }
    }

    async getCertificate(certificateId: string): Promise<Certificate> {
        if (!this.contract) {
          throw new Error('Contract not initialized');
        }

        try {
            return await this.contract.getCertificate(certificateId);
        } catch (error) {
            console.error('Error getting certificate:', error);
            throw error;
        }
    }

    async getConnectedAddress(): Promise<string> {
        if (!this.signer) {
          throw new Error('Wallet not connected');
        }
        return await this.signer.getAddress();
    }
}

// Export a singleton instance
export const certificateService = new CertificateService();