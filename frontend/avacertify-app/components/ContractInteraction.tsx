// src/components/ContractStatus.tsx
import { useState, useEffect } from 'react';
import { certificateService } from '../utils/blockchain';

export const ContractStatus: React.FC = () => {
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    // const [error, setError] = useState<string | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [storedValue, setStoredValue] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            const address = await certificateService.getConnectedAddress();
            setAddress(address);
            setStatus('connected');
            // setError(null);
        } catch (error: any) {
            setStatus('disconnected');
            // setError('Wallet not connected');
        }
    };

    const handleConnect = async () => {
        setStatus('connecting');
        // setError(null);
        try {
            const address = await certificateService.connectWallet();
            setAddress(address);
            setStatus('connected');
        } catch (error: any) {
            setStatus('disconnected');
            // setError(error.message || 'Failed to connect wallet');
        }
    };

    const retrieveValue = async () => {
        try {
            const contract = await getContract();
            if (contract) {
                const value = await contract.retrieve();
                setStoredValue(value.toString());
            }
        } catch (error) {
            console.error("Error retrieving value:", error);
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
                </div>
            )}
            {/* {error && (
                <div className="mt-2 text-sm text-red-600">
                    {error}
                </div>
            )} */}
        </div>
    );
};

export default ContractStatus;