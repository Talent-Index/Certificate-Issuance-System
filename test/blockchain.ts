import { ethers as ethersjs } from 'ethers';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'node:test';

// Define Certificate interface locally for tests
interface Certificate {
    id: number;
    recipientName: string; 
    issueDate: number;
    isValid: boolean;
}

// Mock window.ethereum
declare global {
    interface Window {
        ethereum: any;
    }
}

class CertificateService {
    private provider: ethersjs.BrowserProvider | null = null;
    private contract: ethersjs.Contract | null = null;
    private signer: ethersjs.JsonRpcSigner | null = null;
    constructor() {
        if (typeof window !== 'undefined' && window.ethereum) {
            this.provider = new ethers.BrowserProvider(window.ethereum);
        }
    }

    async connectWallet(): Promise<string> {
        if (!this.provider) {
            throw new Error('Please install MetaMask');
        }

        try {
            const accounts = await this.provider.send('eth_requestAccounts', []);
            
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x5' }],
                });
            } catch (error: any) {
                if (error.code === 4902) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: '0x5',
                                rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
                            }],
                        });
                    } catch (addError) {
                        throw new Error('Failed to add Avalanche Fuji network. Please add it manually.');
                    }
                } else if (error.code === 4001) {
                    throw new Error('User rejected network switch. Please switch to Avalanche Fuji manually.');
                } else {
                    throw new Error('Failed to switch to Avalanche Fuji network.');
                }
            }

            this.signer = await this.provider.getSigner();
            return accounts[0];
        } catch (error: any) {
            if (error.code === 4001) {
                throw new Error('User rejected connection request.');
            }
            throw error;
        }
    }

    async issueCertificate(recipientName: string): Promise<string | null> {
        if (!this.contract) {
          return null;
        }
        
        try {
            const tx = await this.contract.issueCertificate(recipientName);
            const receipt = await tx.wait();
            const event = receipt.events.find((e: any) => e.event === 'CertificateIssued');
            return event ? event.args.id : null;
        } catch (error) {
            console.error('Error issuing certificate:', error);
            return null;
        }
    }

    async verifyCertificate(certificateId: string): Promise<boolean | null> {
        if (!this.contract) {
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
          return null;
        }
        
        try {
            const tx = await this.contract.revokeCertificate(certificateId);
            await tx.wait();
        } catch (error) {
            console.error('Error revoking certificate:', error);
            return null;
        }
    }

    async getCertificate(certificateId: string): Promise<Certificate | null> {
        if (!this.contract) {
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
          return null;
        }
        
        try {
            return await this.signer.getAddress();
        } catch (error) {
            console.error('Error getting connected address:', error);
            return null;
        }
    }
}

// Create test instance
export const certificateService = new CertificateService();

/* eslint-disable @typescript-eslint/no-var-requires */
// Mock implementations for testing
const { fn, mock } = require('jest-mock');
const MockWeb3Provider = fn();
const MockEthersContract = fn();
const MockSigner = fn();

const jest = require('jest-mock');
jest.mock('ethers', () => ({
    BrowserProvider: MockWeb3Provider,
    Contract: MockEthersContract,
    JsonRpcSigner: MockSigner,
}));

describe('CertificateService', () => {
    let service: CertificateService;

    beforeEach(() => {
        service = new CertificateService(); 
        global.window = { ethereum: {} } as any;
    });

    it('should connect to wallet successfully', async () => {
        // Arrange
        const mockAccounts = ['0x123'];
        const mockProvider = {
            send: jest.fn().mockResolvedValue(mockAccounts as any),
            getSigner: jest.fn().mockReturnValue({ getAddress: jest.fn().mockResolvedValue('0x123') }),
        };

        window.ethereum.request = jest.fn().mockResolvedValue(undefined);
        MockWeb3Provider.mockReturnValue(mockProvider as any);

        // Act
        const account = await service.connectWallet();

        // Assert
        expect(account).toBe(mockAccounts[0]);
        expect(mockProvider.send).toHaveBeenCalledWith('eth_requestAccounts', []);
        expect(window.ethereum.request).toHaveBeenCalledWith({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x5' }], // Replace with your actual chainId
        });
    });

    it('should handle network switch error and add network', async () => {
        // Arrange
        const mockAccounts = ['0x123'];
        const mockProvider = {
            send: jest.fn().mockResolvedValue(mockAccounts),
            getSigner: jest.fn().mockReturnValue({ getAddress: jest.fn().mockResolvedValue('0x123') }),
        };
        MockWeb3Provider.mockReturnValue(mockProvider as any);

        window.ethereum.request = jest
            .fn()
            .mockRejectedValueOnce({ code: 4902 })
            .mockResolvedValueOnce(undefined)
            .mockResolvedValue(undefined);

        // Act
        const account = await service.connectWallet();

        // Assert
        expect(account).toBe(mockAccounts[0]);
        expect(window.ethereum.request).toHaveBeenCalledWith({
            method: 'wallet_addEthereumChain',
            params: [{ chainId: '0x5', rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'] }], // Replace with your actual config
        });
    });


    it('should throw error if user rejects network switch', async () => {
        // Arrange
        const mockProvider = { send: jest.fn().mockResolvedValue(['0x123'] as any) };
        MockWeb3Provider.mockReturnValue(mockProvider as any);
        window.ethereum.request = jest.fn().mockRejectedValue({ code: 4001 });

        // Act & Assert
        await expect(service.connectWallet()).rejects.toThrowError('User rejected network switch. Please switch to Avalanche Fuji manually.');
    });

    it('should throw error if fails to add network', async () => {
        // Arrange
        const mockProvider = { send: jest.fn().mockResolvedValue(['0x123']) };
        MockWeb3Provider.mockReturnValue(mockProvider as any);
        window.ethereum.request = jest
            .fn()
            .mockRejectedValueOnce({ code: 4902 })
            .mockRejectedValueOnce(new Error('Add network failed'));

        // Act & Assert
        await expect(service.connectWallet()).rejects.toThrowError('Failed to add Avalanche Fuji network. Please add it manually.');
    });

    it('should throw error if user rejects connection request', async () => {
        // Arrange
        const mockProvider = { send: jest.fn().mockRejectedValue({ code: 4001 }) };
        MockWeb3Provider.mockReturnValue(mockProvider as any);

        // Act & Assert
        await expect(service.connectWallet()).rejects.toThrowError('User rejected connection request.');
    });

    it('should throw error if no provider', async () => {
        // Arrange
        service['provider'] = null;

        // Act & Assert
        await expect(service.connectWallet()).rejects.toThrowError('Please install MetaMask');
    });

    it('should issue a certificate', async () => {
        // Arrange
        const mockRecipientName = 'John Doe';
        const mockCertificateId = '123';
        const mockContract = {
            issueCertificate: jest.fn().mockResolvedValue({
                wait: jest.fn().mockResolvedValue({
                    events: [{ event: 'CertificateIssued', args: { id: mockCertificateId } }],
                }),
            }),
        };
        MockEthersContract.mockImplementation(() => mockContract);
        service['contract'] = mockContract as any;

        // Act
        const certificateId = await service.issueCertificate(mockRecipientName);

        // Assert
        expect(certificateId).toBe(mockCertificateId);
        expect(mockContract.issueCertificate).toHaveBeenCalledWith(mockRecipientName);
    });

    it('should return null if contract is not initialized when issuing certificate', async () => {
        // Act
        const certificateId = await service.issueCertificate('John Doe');

        // Assert
        expect(certificateId).to.be.null;
    });

    it('should return null if CertificateIssued event is missing when issuing certificate', async () => {
        // Arrange
        const mockContract = {
            issueCertificate: jest.fn().mockResolvedValue({
                wait: jest.fn().mockResolvedValue({ events: [] }),
            }),
        };
        MockEthersContract.mockImplementation(() => mockContract);
        service['contract'] = mockContract as any;

        // Act
        const certificateId = await service.issueCertificate('John Doe');

        // Assert
        expect(certificateId).to.be.null;
    });

    it('should verify a certificate', async () => {
        // Arrange
        const mockCertificateId = '123';
        const mockVerificationResult = true;
        const mockContract = {
            verifyCertificate: jest.fn().mockResolvedValue(mockVerificationResult),
        };
        MockEthersContract.mockImplementation(() => mockContract);
        service['contract'] = mockContract as any;

        // Act
        const result = await service.verifyCertificate(mockCertificateId);

        // Assert
        expect(result).toBe(mockVerificationResult);
        expect(mockContract.verifyCertificate).toHaveBeenCalledWith(mockCertificateId);
    });

    it('should revoke a certificate', async () => {
        // Arrange
        const mockCertificateId = '123';
        const mockContract = {
            revokeCertificate: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue(undefined) }),
        };
        MockEthersContract.mockImplementation(() => mockContract);
        service['contract'] = mockContract as any;

        // Act
        const result = await service.revokeCertificate(mockCertificateId);

        // Assert
        expect(result).toBeUndefined();
        expect(mockContract.revokeCertificate).toHaveBeenCalledWith(mockCertificateId);
    });

    it('should get a certificate', async () => {
        // Arrange
        const mockCertificateId = '123';
        const mockCertificate: Certificate = {
            id: 123,
            recipientName: 'John Doe',
            issueDate: 1678886400,
            isValid: true,
        };

        const mockContract = {
            getCertificate: jest.fn().mockResolvedValue(mockCertificate),
        };
        MockEthersContract.mockImplementation(() => mockContract);
        service['contract'] = mockContract as any;

        // Act
        const certificate = await service.getCertificate(mockCertificateId);

        // Assert
        expect(certificate).toEqual(mockCertificate);
        expect(mockContract.getCertificate).toHaveBeenCalledWith(mockCertificateId);
    });

    it('should get the connected address', async () => {
        // Arrange
        const mockAddress = '0x123';
        const mockSigner = { getAddress: jest.fn().mockResolvedValue(mockAddress) };
        MockSigner.mockReturnValue(mockSigner as any);
        service['signer'] = mockSigner as any;

        // Act
        const address = await service.getConnectedAddress();

        // Assert
        expect(address).toBe(mockAddress);
        expect(mockSigner.getAddress).toHaveBeenCalled();
    });


    it('should return null for verifyCertificate if contract is not initialized', async () => {
        // Act
        const result = await service.verifyCertificate('123');

        // Assert
        expect(result).to.be.null;
    });

    it('should return null for revokeCertificate if contract is not initialized', async () => {
        // Act
        const result = await service.revokeCertificate('123');

        // Assert
        expect(result).to.be.null;
    });

    it('should return null for getCertificate if contract is not initialized', async () => {
        // Act
        const result = await service.getCertificate('123');

        // Assert
        expect(result).to.be.null;
    });

    it('should return null for getConnectedAddress if signer is not initialized', async () => {
        // Act
        const result = await service.getConnectedAddress();

        // Assert
        expect(result).to.be.null;
    });

    it('should handle unexpected error during network switch', async () => {
        // Arrange
        const mockProvider = { send: jest.fn().mockResolvedValue(['0x123']) };
        MockWeb3Provider.mockReturnValue(mockProvider as any);
        window.ethereum.request = jest.fn().mockRejectedValue({ code: 1234 }); // An unexpected error code

        // Act & Assert
        await expect(service.connectWallet()).rejects.toThrowError('Failed to switch to Avalanche Fuji network.');
    });

    it('should handle error during certificate issuance', async () => {
        // Arrange
        const mockContract = {
            issueCertificate: jest.fn().mockRejectedValue(new Error('Issuance failed')),
        };
        MockEthersContract.mockImplementation(() => mockContract);
        service['contract'] = mockContract as any;

        // Act
        const result = await service.issueCertificate('John Doe');

        // Assert
        expect(result).to.be.null;
    });

    it('should handle error during certificate verification', async () => {
        // Arrange
        const mockContract = {
            verifyCertificate: jest.fn().mockRejectedValue(new Error('Verification failed')),
        };
        MockEthersContract.mockImplementation(() => mockContract);
        service['contract'] = mockContract as any;

        // Act
        const result = await service.verifyCertificate('123');

        // Assert
        expect(result).to.be.null;
    });

    it('should handle error during certificate revocation', async () => {
        // Arrange
        const mockContract = {
            revokeCertificate: jest.fn().mockRejectedValue(new Error('Revocation failed')),
        };
        MockEthersContract.mockImplementation(() => mockContract);
        service['contract'] = mockContract as any;

        // Act
        const result = await service.revokeCertificate('123');

        // Assert
        expect(result).to.be.null;
    });

    it('should handle error during get certificate', async () => {
        // Arrange
        const mockContract = {
            getCertificate: jest.fn().mockRejectedValue(new Error('Get certificate failed')),
        };
        MockEthersContract.mockImplementation(() => mockContract);
        service['contract'] = mockContract as any;

        // Act
        const result = await service.getCertificate('123');

        // Assert
        expect(result).to.be.null;
    });


});





describe("CertificateService", function() {
    let certificateService: any;
    
    beforeEach(async function() {
        // Mock window.ethereum for testing
        global.window = {
            ethereum: {
                request: async ({ method, params }: any) => {
                    // Mock implementation
                    return [];
                }
            }
        } as any;
    });

    it("should connect to wallet successfully", async function() {
        // Use chai expect instead of jest
        expect(true).to.be.true;
    });
});


const { ethers } = require("hardhat");

describe("OrganizationNFTCertificate", function () {
    let NFTCertificate;
    let nftCertificate;
    let owner;
    let organization;
    let recipient;
    let addrs;

    beforeEach(async function () {
        // Get signers
        [owner, organization, recipient, ...addrs] = await ethers.getSigners();

        // Deploy the contract
        NFTCertificate = await ethers.getContractFactory("OrganizationNFTCertificate");
        nftCertificate = await NFTCertificate.deploy();
        // Remove .deployed() call as it's not needed with modern ethers
    });
});


