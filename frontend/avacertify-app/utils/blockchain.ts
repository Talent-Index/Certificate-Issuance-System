// utils/blockchain.ts
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
                // This could be due to the network not existing or the user rejecting the switch
                if (switchError.code === 4902) {
                    try {
                        await window.ethereum.request({
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

            this.signer = this.provider.getSigner();
            this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);

            return accounts[0];
        } catch (error: any) {
            console.error('Error connecting wallet:', error);
            if (error.code === 4001) {
                throw new Error('User rejected connection request.');
            }
            throw error;
        }
    }

    async issueCertificate(recipientName: string): Promise<string | null> {
        if (!this.contract) {
            console.warn('Contract not initialized');
            return null;
        }

        try {
            const tx = await this.contract.issueCertificate(recipientName);
            const receipt = await tx.wait();

            const event = receipt.events?.find((e: { event: string; }) => e.event === 'CertificateIssued');
            if (!event || !event.args || !event.args.id) {
                console.error('CertificateIssued event not found or missing id argument', receipt);
                return null;
            }
            return event.args.id.toString();
        } catch (error) {
            console.error('Error issuing certificate:', error);
            return null;
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
        if (!this.contract) {
            console.warn('Contract not initialized');
            return null;
        }

        try {
            return await this.contract.getCertificate(certificateId);
        } catch (error) {
            console.error('Error getting certificate:', error);
            return null;
        }
    }

    async getConnectedAddress(): Promise<string | null> {
        if (!this.signer) {
            console.warn('Wallet not connected');
            return null;
            //         } catch (switchError: any) {
            //             // Add the network if it doesn't exist
            //             if (switchError.code === 4902) {
            //                 await window.ethereum.request({
            //                     method: 'wallet_addEthereumChain',
            //                     params: [AVALANCHE_FUJI_CONFIG],
            //                 });
            //             }
            //         }

            //         this.signer = this.provider.getSigner();
            //         this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);

            //         return accounts[0];
            //     } catch (error) {
            //         console.error('Error connecting wallet:', error);
            //         throw error;
            //     }
            // }

            // async issueCertificate(recipientName: string): Promise<string> {
            //     if (!this.contract) {
            //       throw new Error('Contract not initialized');
            //     }

            //     try {
            //         const tx = await this.contract.issueCertificate(recipientName);
            //         const receipt = await tx.wait();

            //         // Get certificate ID from events
            //         const event = receipt.events?.find((e: { event: string; }) => e.event === 'CertificateIssued');
            //         return event?.args?.id.toString() || '';
            //     } catch (error) {
            //         console.error('Error issuing certificate:', error);
            //         throw error;
            //     }
            // }

            // async verifyCertificate(certificateId: string): Promise<boolean> {
            //     if (!this.contract) {
            //       throw new Error('Contract not initialized');
            //     }

            //     try {
            //         return await this.contract.verifyCertificate(certificateId);
            //     } catch (error) {
            //         console.error('Error verifying certificate:', error);
            //         throw error;
            //     }
            // }

            // async revokeCertificate(certificateId: string): Promise<void> {
            //     if (!this.contract) {
            //       throw new Error('Contract not initialized');
            //     }

            //     try {
            //         const tx = await this.contract.revokeCertificate(certificateId);
            //         await tx.wait();
            //     } catch (error) {
            //         console.error('Error revoking certificate:', error);
            //         throw error;
            //     }
            // }

            // async getCertificate(certificateId: string): Promise<Certificate> {
            //     if (!this.contract) {
            //       throw new Error('Contract not initialized');
            //     }

            //     try {
            //         return await this.contract.getCertificate(certificateId);
            //     } catch (error) {
            //         console.error('Error getting certificate:', error);
            //         throw error;
            //     }
            // }

            // async getConnectedAddress(): Promise<string> {
            //     if (!this.signer) {
            //       throw new Error('Wallet not connected');
            //     }
            //     return await this.signer.getAddress();
        }
        return await this.signer.getAddress();
    }
}

// Export a singleton instance
export const certificateService = new CertificateService();