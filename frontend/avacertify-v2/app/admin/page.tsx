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

interface UploadState {
    isUploading: boolean
    documentHash: string
    metadataHash: string
}

// Helper functions for IPFS uploads
async function uploadToIPFS(file: File): Promise<string> {
    // Implement your IPFS upload logic here
    // Return the IPFS hash
    throw new Error("IPFS upload not implemented")
}

async function uploadMetadataToIPFS(metadata: object): Promise<string> {
    // Implement your IPFS metadata upload logic here
    // Return the IPFS hash
    throw new Error("IPFS metadata upload not implemented")
}

async function issueCertificate(
    recipientAddress: string,
    recipientName: string,
    certificateType: string,
    documentHash: string,
    metadataHash: string
): Promise<string | null> {
    // Implement your certificate issuing logic here
    // Return the transaction hash or null
    throw new Error("Certificate issuing not implemented")
}

export default function AdminPage() {
    const [uploadState, setUploadState] = useState<UploadState>({
        isUploading: false,
        documentHash: "",
        metadataHash: "",
    })
    const [isIssuing, setIsIssuing] = useState(false)
    const { toast } = useToast()

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setUploadState(prev => ({ ...prev, isUploading: true }))
        try {
            // Upload to IPFS
            const documentHash = await uploadToIPFS(file)
            setUploadState(prev => ({ ...prev, documentHash }))
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

            // Generate and upload metadata
            const metadata = {
                name: `Certificate for ${recipientName}`,
                description: `${certificateType} certificate`,
                image: `ipfs://${uploadState.documentHash}`,
                attributes: [
                    { trait_type: "Recipient", value: recipientName },
                    { trait_type: "Type", value: certificateType },
                    { trait_type: "Issue Date", value: new Date().toISOString() },
                ],
            }

            // Upload metadata to IPFS
            const metadataHash = await uploadMetadataToIPFS(metadata)

            // Issue certificate
            const contract = certificateService.getContract() // Replace with your actual method to get the contract instance

            const resolvedContract = await contract;
            const gasEstimate = await resolvedContract.estimateGas.issueCertificate(
                recipientAddress,
                recipientName // Adjusted to pass only one argument as per the contract's definition
            )

            const tx = await resolvedContract.issueCertificate(
                recipientAddress, recipientName
            )
            toast({
                title: "Certificate issued successfully!",
                description: "The certificate has been issued successfully.",
                variant: "default",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to issue certificate",
                variant: "destructive",
            })
        } finally {
            setUploadState({ isUploading: false, documentHash: "", metadataHash: "" })
            setIsIssuing(false)
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
                                {uploadState.documentHash && (
                                    <p className="text-sm text-muted-foreground">
                                        IPFS Hash: {uploadState.documentHash}
                                    </p>
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