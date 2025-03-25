import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const TransactionDialog: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    txHash?: string;
    status: 'pending' | 'success' | 'error';
    message: string;
}> = ({ isOpen, onClose, txHash, status, message }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Transaction Status</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className={`p-4 rounded ${
                        status === 'success' ? 'bg-green-100' :
                        status === 'error' ? 'bg-red-100' :
                        'bg-yellow-100'
                    }`}>
                        {message}
                    </div>
                    {txHash && (
                        <div className="text-sm">
                            Transaction Hash: {txHash}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};