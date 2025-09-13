"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload } from "lucide-react"
import { certificateService } from "@/utils/blockchain"
import { CERTIFICATE_SYSTEM_ADDRESS, NFT_CERTIFICATE_ADDRESS } from "@/utils/contractConfig"
import { IPFSService } from "@/utils/ipfsService" // Import the IPFS service
require('dotenv').config();

interface UploadState {
    isUploading: boolean
    documentHash: string
    metadataHash: string
    documentUrl: string // Add URL for preview purposes
}

export default function AdminPage() {
    const [uploadState, setUploadState] = useState<UploadState>({
        isUploading: false,
        documentHash: "",
        metadataHash: "",
        documentUrl: ""
    })
    const [isIssuing, setIsIssuing] = useState(false)
    const [walletAddress, setWalletAddress] = useState<string | null>(null)
    const { toast } = useToast()

    // Initialize IPFS service - in a real app you might want to do this in a context or hook
    let ipfsService: IPFSService;
    try {
        ipfsService = new IPFSService();
    } catch (error) {
        console.error("Failed to initialize IPFS service:", error);
        // Create a mock service that will show proper error messages
        ipfsService = {
            checkApiKeys: () => false,
            generateMetadata: () => { throw new Error("IPFS service not properly configured") },
            uploadFile: async () => { throw new Error("IPFS service not properly configured") },
            uploadJSON: async () => { throw new Error("IPFS service not properly configured") },
            getGatewayUrl: (cid: string) => `https://gateway.pinata.cloud/ipfs/${cid}`
        } as unknown as IPFSService;
    }

    // Ensure wallet is connected and certificateService is initialized with signer
    useEffect(() => {
        const ensureWallet = async () => {
            try {
                const address = await certificateService.getConnectedAddress();
                if (!address) {
                    const connected = await certificateService.connectWallet();
                    setWalletAddress(connected);
                } else {
                    setWalletAddress(address);
                }
            } catch (error) {
                setWalletAddress(null);
            }
        };
        ensureWallet();
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) {
          return
        }

        setUploadState(prev => ({ ...prev, isUploading: true }))
        try {
            // Upload file to IPFS using our service
            const documentHash = await ipfsService.uploadFile(file);
            const documentUrl = ipfsService.getGatewayUrl(documentHash);

            setUploadState(prev => ({
                ...prev,
                documentHash,
                documentUrl
            }))

            toast({
                title: "File Uploaded",
                description: "Document successfully uploaded to IPFS",
            })
        } catch (error) {
            toast({
                title: "Upload Failed",
                description: error instanceof Error ? error.message : "Failed to upload file",
                variant: "destructive",
            })
        } finally {
            setUploadState(prev => ({ ...prev, isUploading: false }))
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsIssuing(true)

        try {
            // Check wallet connection before proceeding
            const address = await certificateService.getConnectedAddress();
            if (!address) {
                toast({
                    title: "Wallet Not Connected",
                    description: "Please connect your wallet before issuing a certificate.",
                    variant: "destructive",
                });
                setIsIssuing(false);
                return;
            }

            // Ensure event.currentTarget is a form element
            const form = event.currentTarget as HTMLFormElement;
            const formData = new FormData(form);

            const recipientAddress = formData.get("recipientAddress") as string
            const recipientName = formData.get("recipientName") as string
            const certificateType = formData.get("certificateType") as string

            // For now, we'll issue the certificate without requiring IPFS upload
            // In production, you might want to make IPFS upload mandatory
            let documentHash = uploadState.documentHash;
            let metadataHash = uploadState.metadataHash;

            // If no document was uploaded, create a simple placeholder
            if (!documentHash) {
                console.warn("No document uploaded, proceeding with certificate issuance only");
            }

            // Generate metadata (even if we don't have a document)
            const metadata = {
                name: `Certificate for ${recipientName}`,
                description: `${certificateType} certificate`,
                image: documentHash ? `ipfs://${documentHash}` : "",
                attributes: [
                    { trait_type: "Recipient", value: recipientName },
                    { trait_type: "Type", value: certificateType },
                    { trait_type: "Issue Date", value: new Date().toISOString() },
                    { trait_type: "Issuer", value: "AvaCertify" }
                ],
            }

            // Try to upload metadata to IPFS, but don't fail if it doesn't work
            try {
                if (documentHash) {
                    metadataHash = await ipfsService.uploadJSON(metadata);
                    setUploadState(prev => ({ ...prev, metadataHash }));
                }
            } catch (ipfsError) {
                console.warn("Failed to upload metadata to IPFS:", ipfsError);
                // Continue without IPFS metadata
            }

            // Issue certificate on blockchain using the correct function signature
            const contract = await certificateService.getContract();

            // Estimate gas for the issueCertificate function (recipientName, owner)
            const gasEstimate = await contract.issueCertificate.estimateGas(
                recipientName,
                recipientAddress
            );

            // Issue certificate and get transaction receipt
            const txResponse = await contract.issueCertificate(
                recipientName,
                recipientAddress,
                {
                    gasLimit: Math.ceil(Number(gasEstimate) * 1.2)
                }
            );
            const receipt = await txResponse.wait();

            // Extract certificateId from event
            let certificateId;
            for (const log of receipt.logs) {
                if (log.address.toLowerCase() === CERTIFICATE_SYSTEM_ADDRESS.toLowerCase()) {
                    try {
                        const parsedLog = contract.interface.parseLog(log);
                        if (parsedLog?.name === 'CertificateIssued') {
                            certificateId = parsedLog.args.id.toString();
                            break;
                        }
                    } catch (e) {
                        // Skip logs that can't be parsed
                        continue;
                    }
                }
            }

            // Optionally mint NFT certificate (using the NFT contract)
            if (certificateId && window.confirm('Would you like to mint an NFT certificate? This requires an additional transaction.')) {
                try {
                    // Note: This would require a separate contract instance for the NFT contract
                    // For now, we'll just log the success without minting NFT
                    console.log('Certificate issued successfully. NFT minting would require separate implementation.');
                } catch (nftError) {
                    console.error('NFT minting failed:', nftError);
                    // Don't fail the whole transaction if NFT minting fails
                }
            }

            toast({
                title: "Certificate issued successfully!",
                description: `Transaction hash: ${receipt.transactionHash}`,
                variant: "default",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to issue certificate",
                variant: "destructive",
            });
        } finally {
            setUploadState({ isUploading: false, documentHash: "", metadataHash: "", documentUrl: "" });
            setIsIssuing(false);
        }
    }

    return (
        <Layout>
            <div className="container mx-auto py-10 max-w-4xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Issue new certificates using the deployed smart contracts</p>
                    {walletAddress && (
                        <p className="text-sm text-blue-600 mt-2">
                            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </p>
                    )}
                </div>
                <Card className="mx-auto">
                    <CardHeader className="text-center">
                        <CardTitle>Issue New Certificate</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Certificate System: {CERTIFICATE_SYSTEM_ADDRESS.slice(0, 6)}...{CERTIFICATE_SYSTEM_ADDRESS.slice(-4)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            NFT Contract: {NFT_CERTIFICATE_ADDRESS.slice(0, 6)}...{NFT_CERTIFICATE_ADDRESS.slice(-4)}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="document">Certificate Document</Label>
                                <Input
                                    id="document"
                                    type="file"
                                    accept="application/pdf,image/*"
                                    onChange={handleFileUpload}
                                    disabled={uploadState.isUploading}
                                />
                                {uploadState.isUploading && (
                                    <div className="flex items-center mt-2">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        <p className="text-sm">Uploading to IPFS...</p>
                                    </div>
                                )}
                                {uploadState.documentHash && (
                                    <div className="mt-2 space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                            IPFS Hash: {uploadState.documentHash}
                                        </p>
                                        <div className="text-sm text-blue-600">
                                            <a
                                                href={uploadState.documentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View on IPFS Gateway
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="recipientAddress">Recipient Address</Label>
                                <Input
                                    id="recipientAddress"
                                    name="recipientAddress"
                                    placeholder="0x..."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="recipientName">Recipient Name</Label>
                                <Input
                                    id="recipientName"
                                    name="recipientName"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="certificateType">Certificate Type</Label>
                                <Input
                                    id="certificateType"
                                    name="certificateType"
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={isIssuing || uploadState.isUploading}>
                                {isIssuing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Issuing Certificate...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Issue Certificate
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    )
}