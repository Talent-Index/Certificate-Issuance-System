// src/components/ContractStatus.tsx
import { useState, useEffect } from 'react';
import { certificateService } from '@/utils/blockchain';

export const ContractStatus: React.FC = () => {
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [address, setAddress] = useState<string | null>(null);
    const [isIssuing, setIsIssuing] = useState(false);

    useEffect(() => {
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
            const address = await certificateService.connectWallet();
            setAddress(address);
            setStatus('connected');
        } catch (error: any) {
            setStatus('disconnected');
        }
    };

    const handleIssueCertificate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsIssuing(true);

        try {
            const form = e.currentTarget;
            const recipientName = (form.elements.namedItem('recipientName') as HTMLInputElement).value;

            if (!recipientName) {
                throw new Error('Recipient name is required');
            }

            const id = await certificateService?.issueCertificate(recipientName);

            toast({
                title: "Success",
                description: `Certificate issued with ID: ${id}`,
            });

            form.reset();
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
        </div>
    );
};

export default ContractStatus;