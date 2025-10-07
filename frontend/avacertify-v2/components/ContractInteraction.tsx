// src/components/ContractStatus.tsx
import { useState, useEffect } from 'react';
import { certificateService } from '@/utils/blockchain';

/**
 * Component for interacting with the smart contract
 * Provides wallet connection and certificate management functionality
 * @returns React component for contract interaction
 */
const ContractInteraction = () => {
    // This component is currently empty. You can implement it or remove it if not needed.
}


// Import from a toast library like react-hot-toast or create a custom toast component
import { toast as hotToast } from '@/hooks/use-toast';

function toast({ title, description, variant = 'default' }: {
    title: string;
    description: string;
    variant?: 'default' | 'destructive'
}) {
    const message = `${title}: ${description}`;
    if (variant === 'destructive') {
        hotToast({
            title: message,
            variant: "destructive",
        });
    } else {
        hotToast({
            title: message,
            variant: "default",
        });
    }
}


export const ContractStatus: React.FC = () => {
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [address, setAddress] = useState<string | null>(null);
    const [isIssuing, setIsIssuing] = useState(false);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const connectedAddress = certificateService.getConnectedAddress();
                if (typeof connectedAddress === 'string' && connectedAddress) {
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

    const _checkConnection = async () => {
        try {
            const address = certificateService.getConnectedAddress();
            if (typeof address === 'string' && address) {
                setAddress(address);
                setStatus('connected');
            } else {
                setStatus('disconnected');
            }
        } catch (_error: unknown) {
            setStatus('disconnected');
        }
    };

    const handleConnect = async () => {
        setStatus('connecting');
        try {
            const connectedAddress = await certificateService.connectWallet();
            setAddress(connectedAddress);
            setStatus('connected');
        } catch (_err: unknown) {
            console.error(_err);
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
        } catch (_err: unknown) {
            console.error('Failed to get certificate:', _err);
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
        } catch (_error: unknown) {
            console.error(_error);
            toast({
                title: "Error",
                description: _error instanceof Error ? _error.message : String(_error),
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
                    <form onSubmit={handleIssueCertificate} className="mt-4">
                        <input
                            type="text"
                            name="recipientName"
                            placeholder="Recipient Name"
                            className="px-4 py-2 border rounded"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isIssuing}
                            className="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 
                            disabled:bg-gray-400 transition-colors"
                        >
                            {isIssuing ? 'Issuing...' : 'Issue Certificate'}
                        </button>
                    </form>
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