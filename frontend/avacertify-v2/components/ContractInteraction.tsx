// src/components/ContractStatus.tsx
import { useState, useEffect } from 'react';
import { certificateService } from '@/utils/blockchain';
import { toast } from '@/hooks/use-toast';

/**
 * Component for interacting with the smart contract
 * Provides wallet connection and certificate management functionality
 * @returns React component for contract interaction
 */
const ContractInteraction: React.FC = () => {
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [address, setAddress] = useState<string | null>(null);
    const [isIssuing, setIsIssuing] = useState(false);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const connectedAddress = await certificateService.getConnectedAddress();
                if (connectedAddress) {
                    setAddress(connectedAddress);
                    setStatus('connected');
                } else {
                    setStatus('disconnected');
                }
            } catch (err) {
                console.error(err);
                setStatus('disconnected');
            }
        };
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            const address = await certificateService.getConnectedAddress();
            setAddress(address);
            setStatus('connected');
        } catch (error: any) {
            setStatus('disconnected');
        }
    };

    const handleConnect = async () => {
        setStatus('connecting');
        try {
            const connectedAddress = await certificateService.connectWallet();
            setAddress(connectedAddress);
            setStatus('connected');
        } catch (err) {
            console.error(err);
            setStatus('disconnected');
        }
    };


    /**
     * Retrieves certificate information
     * Fetches a test certificate with ID "1" for testing purposes
     */
    const handleGetCertificate = async () => {
        try {
            const cert = await certificateService.getCertificate("1");
            console.log('Certificate:', cert);
        } catch (err) {
            console.error('Failed to get certificate:', err);
        }
    };

    /**
     * Handles certificate issuance
     * Issues a test certificate with hardcoded values for testing purposes
     */
    const handleIssueCertificate = async () => {
        setIsIssuing(true);

        try {
            const recipientName = prompt('Enter recipient name:');

            if (!recipientName) {
                throw new Error('Recipient name is required');
            }

            // Provide a second argument as required by issueCertificate (e.g., a placeholder or actual value)
            const id = await certificateService?.issueCertificate(recipientName, "");

            toast({
                title: "Success",
                description: `Certificate issued with ID: ${id}`,
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to issue certificate",
                variant: "destructive"
            });
        } finally {
            setIsIssuing(false);

        }
    };

    return (
        <div className="mb-4 p-4 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div
                        className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-green-500' :
                                status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                    />
                    <span className="font-medium">
                        {status === 'connected' ? 'Connected' :
                            status === 'connecting' ? 'Connecting...' : 'Disconnected'}
                    </span>
                </div>
                {status !== 'connected' && (
                    <button
                        onClick={handleConnect}
                        disabled={status === 'connecting'}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 
                    disabled:bg-gray-400 transition-colors"
                    >
                        Connect Wallet
                    </button>
                )}
            </div>
            {address && (
                <div className="mt-2 text-sm text-gray-600">
                    Address: {address.substring(0, 6)}...{address.substring(address.length - 4)}
                    <button
                        type="button"
                        onClick={handleConnect}
                        disabled={status === 'connecting'}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 
                    disabled:bg-gray-400 transition-colors"
                    >
                        Reconnect
                    </button>
                </div>
            )}
            <div className="mt-4 flex space-x-2">
                <button onClick={handleIssueCertificate} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                    Issue Test Certificate
                </button>
                <button onClick={handleGetCertificate} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                    Get Test Certificate
                </button>
            </div>
        </div>
    );
};

export default ContractInteraction;