"use client"

import { useState } from "react"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload } from "lucide-react"
import { certificateService } from "@/utils/blockchain"
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
    const { toast } = useToast()

    // Initialize IPFS service - in a real app you might want to do this in a context or hook
    let ipfsService: IPFSService;
    try {
        ipfsService = new IPFSService();
    } catch (error) {
        console.error("Failed to initialize IPFS service:", error);
    }

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
            const formData = new FormData(event.currentTarget)
            const recipientAddress = formData.get("recipientAddress") as string
            const recipientName = formData.get("recipientName") as string
            const certificateType = formData.get("certificateType") as string

            if (!uploadState.documentHash) {
                throw new Error("Please upload a certificate document first")
            }

            // Generate metadata using our IPFS service format
            const metadata = {
                name: `Certificate for ${recipientName}`,
                description: `${certificateType} certificate`,
                image: `ipfs://${uploadState.documentHash}`,
                attributes: [
                    { trait_type: "Recipient", value: recipientName },
                    { trait_type: "Type", value: certificateType },
                    { trait_type: "Issue Date", value: new Date().toISOString() },
                    { trait_type: "Issuer", value: "AvaCertify" }
                ],
            }

            // Upload metadata to IPFS
            const metadataHash = await ipfsService.uploadJSON(metadata);
            const metadataUrl = ipfsService.getGatewayUrl(metadataHash);

            // Update state with metadata hash
            setUploadState(prev => ({ ...prev, metadataHash }));

            console.log("Document URL:", uploadState.documentUrl);
            console.log("Metadata URL:", metadataUrl);

            // Issue certificate on blockchain
            const contract = certificateService.getContract();
            const resolvedContract = await contract;

            // Estimate gas for the transaction (parameters based on your smart contract)
            // @ts-expect-error: Dynamic contract method call
            const gasEstimate = await resolvedContract.estimateGas["issueCertificate"](
                recipientAddress,
                metadataHash  // Pass the metadata IPFS hash to the contract
            );

            // Execute the transaction with the same parameters
            
            const tx = await resolvedContract["issueCertificate"](
                recipientAddress,
                metadataHash,
                {
                    gasLimit: Math.ceil(Number(gasEstimate) * 1.2) // Add 20% buffer
                }
            );

            // Wait for transaction to be mined
            const receipt = await tx.wait();

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
            <div className="container py-10">
                <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Issue New Certificate</CardTitle>
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
                            <Button type="submit" disabled={isIssuing || uploadState.isUploading || !uploadState.documentHash}>
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