"use client";

import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, CheckCircle } from "lucide-react";
import { certificateService, Certificate } from "@/utils/blockchain";
import { IPFSService } from "@/utils/ipfsService";
import { CERTIFICATE_SYSTEM_ADDRESS, NFT_CERTIFICATE_ADDRESS, AVALANCHE_FUJI_CONFIG } from "@/utils/contractConfig";
import { ethers } from "ethers";

interface UploadState {
    isUploading: boolean;
    documentHash: string;
    metadataHash: string;
    documentUrl: string;
}

interface WalletState {
    address: string | null;
    isConnecting: boolean;
    isConnected: boolean;
}

export default function AdminPage() {
    const [uploadState, setUploadState] = useState<UploadState>({
        isUploading: false,
        documentHash: "",
        metadataHash: "",
        documentUrl: "",
    });
    const [isIssuing, setIsIssuing] = useState(false);
    const [isNFT, setIsNFT] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [walletState, setWalletState] = useState<WalletState>({
        address: null,
        isConnecting: false,
        isConnected: false,
    });
    const [formData, setFormData] = useState({
        recipientAddress: "",
        recipientName: "",
        certificateType: "",
        issueDate: "",
        institutionName: "AvaCertify",
        logoUrl: "",
        brandColor: "#FFFFFF",
    });
    const { toast } = useToast();
    const ipfsService = new IPFSService();

    const checkNetwork = useCallback(async () => {
        const network = await certificateService.getNetwork();
        if (!network || network.chainId !== BigInt(parseInt(AVALANCHE_FUJI_CONFIG.chainId, 16))) {
            throw new Error("Please connect to Avalanche Fuji Testnet");
        }
    }, []);

    useEffect(() => {
        const checkExistingConnection = async () => {
            try {
                await certificateService.init();
                const address = await certificateService.getConnectedAddress();
                if (address) {
                    await checkNetwork();
                    setWalletState({
                        address,
                        isConnecting: false,
                        isConnected: true,
                    });
                    const registered = await certificateService.isOrganizationRegistered();
                    setIsRegistered(registered);
                    toast({
                        title: "Connected",
                        description: `Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
                    });
                }
            } catch (error: unknown) {
                console.error("Init error:", error);
                toast({
                    title: "Initialization Error",
                    description: error instanceof Error ? error.message : "Failed to initialize blockchain service",
                    variant: "destructive",
                });
            }
        };

        checkExistingConnection();
    }, [toast, checkNetwork]);

    

    const connectWallet = async () => {
        if (walletState.isConnecting) {
            toast({
                title: "Connection In Progress",
                description: "Please wait for the current connection attempt to complete",
                variant: "destructive",
            });
            return;
        }

        setWalletState((prev) => ({ ...prev, isConnecting: true }));

        try {
            const address = await certificateService.connectWallet();
            await checkNetwork();
            setWalletState({
                address,
                isConnecting: false,
                isConnected: true,
            });
            const registered = await certificateService.isOrganizationRegistered();
            setIsRegistered(registered);
            toast({
                title: "Wallet Connected",
                description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
            });
        } catch (error: unknown) {
            setWalletState((prev) => ({
                ...prev,
                isConnecting: false,
                isConnected: false,
            }));
            toast({
                title: "Connection Failed",
                description: error instanceof Error ? error.message : "Failed to connect wallet",
                variant: "destructive",
            });
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
          return;
        }

        const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            toast({
                title: "Invalid File Type",
                description: "Please upload a PDF or image file (JPG, PNG)",
                variant: "destructive",
            });
            return;
        }

        if (file.size > maxSize) {
            toast({
                title: "File Too Large",
                description: "File size must be less than 5MB",
                variant: "destructive",
            });
            return;
        }

        setUploadState((prev) => ({ ...prev, isUploading: true }));

        try {
            const documentHash = await ipfsService.uploadFile(file);
            const documentUrl = ipfsService.getGatewayUrl(documentHash);
            const metadata = ipfsService.generateMetadata(
                formData.certificateType || "Certificate",
                "Certificate issued by AvaCertify",
                documentHash,
                formData.brandColor,
                formData.institutionName
            );
            const metadataHash = await ipfsService.uploadJSON(metadata);

            setUploadState((prev) => ({
                ...prev,
                isUploading: false,
                documentHash,
                metadataHash,
                documentUrl,
            }));

            toast({
                title: "File Uploaded",
                description: "Document and metadata successfully uploaded to IPFS",
            });
        } catch (error: unknown) {
            setUploadState((prev) => ({ ...prev, isUploading: false }));
            toast({
                title: "Upload Failed",
                description: error instanceof Error ? error.message : "Failed to upload file to IPFS",
                variant: "destructive",
            });
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleRegisterOrganization = async () => {
        if (!formData.logoUrl || !formData.brandColor) {
            toast({
                title: "Missing Information",
                description: "Please provide logo URL and brand color",
                variant: "destructive",
            });
            return;
        }

        try {
            await certificateService.registerOrganization(formData.logoUrl, formData.brandColor);
            setIsRegistered(true);
            toast({
                title: "Organization Registered",
                description: "Successfully registered organization for NFT certificates",
            });
        } catch (error: unknown) {
            toast({
                title: "Registration Failed",
                description: error instanceof Error ? error.message : "Failed to register organization",
                variant: "destructive",
            });
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!walletState.isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet before issuing a certificate",
                variant: "destructive",
            });
            return;
        }

        if (!formData.recipientAddress || !formData.recipientName || !formData.certificateType || !formData.issueDate) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        if (!ethers.isAddress(formData.recipientAddress)) {
            toast({
                title: "Invalid Address",
                description: "Please enter a valid Ethereum address",
                variant: "destructive",
            });
            return;
        }

        if (isNFT && !isRegistered) {
            toast({
                title: "Organization Not Registered",
                description: "Please register your organization before issuing NFT certificates",
                variant: "destructive",
            });
            return;
        }

        setIsIssuing(true);

        try {
            await checkNetwork();
            toast({
                title: "Transaction Pending",
                description: "Please confirm the transaction in your wallet",
            });

            let certificateId: string;
            if (isNFT) {
                const metadata = ipfsService.generateMetadata(
                    formData.certificateType,
                    "Certificate issued by AvaCertify",
                    uploadState.documentHash,
                    formData.brandColor,
                    formData.institutionName
                );
                const metadataHash = await ipfsService.uploadJSON(metadata);
                certificateId = await certificateService.mintNFTCertificate(formData.recipientAddress, ipfsService.getGatewayUrl(metadataHash));
            } else {
                certificateId = await certificateService.issueCertificate(formData.recipientName, formData.recipientAddress);
            }

            if (!certificateId) {
                throw new Error("Failed to retrieve certificate ID");
            }

            const newCertificate: Certificate = {
                id: certificateId,
                certificateId,
                recipientName: formData.recipientName,
                recipientAddress: formData.recipientAddress,
                certificateType: formData.certificateType,
                issueDate: formData.issueDate,
                institutionName: formData.institutionName,
                status: "active",
                documentHash: uploadState.documentHash,
                documentUrl: uploadState.documentUrl,
                isNFT,
            };

            const storedCertificates = JSON.parse(localStorage.getItem("certificates") || "[]") as Certificate[];
            storedCertificates.push(newCertificate);
            localStorage.setItem("certificates", JSON.stringify(storedCertificates));

            toast({
                title: isNFT ? "NFT Certificate Issued" : "Certificate Issued",
                description: `Certificate ${certificateId} issued successfully to ${formData.recipientName}`,
            });

            setFormData({
                recipientAddress: "",
                recipientName: "",
                certificateType: "",
                issueDate: "",
                institutionName: "AvaCertify",
                logoUrl: "",
                brandColor: "#FFFFFF",
            });
            setUploadState({
                isUploading: false,
                documentHash: "",
                metadataHash: "",
                documentUrl: "",
            });
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) {
              fileInput.value = "";
            }
        } catch (error: unknown) {
            let message = isNFT ? "Failed to mint NFT certificate" : "Failed to issue certificate";
            if (error instanceof Error) {
                if (error.message.includes("ACTION_REJECTED") || error.message.includes("4001")) {
                    message = "User rejected the transaction";
                } else if (error.message.includes("insufficient funds")) {
                    message = "Insufficient AVAX for gas fees. Get test AVAX from faucet.";
                } else if (error.message.includes("network")) {
                    message = "Please ensure you're connected to the Avalanche Fuji Testnet";
                } else if (error.message.includes("not authorized")) {
                    message = "Wallet not authorized to issue certificates. Contact admin.";
                } else if (error.message.includes("not registered")) {
                    message = "Organization not registered. Please register first.";
                }
            }
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        } finally {
            setIsIssuing(false);
        }
    };

    return (
        <Layout>
            <div className="container py-10">
                <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

                <div className="space-y-6 max-w-2xl mx-auto">
                    {!walletState.isConnected && (
                        <Button onClick={connectWallet} disabled={walletState.isConnecting} className="w-full">
                            {walletState.isConnecting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                "Connect Wallet"
                            )}
                        </Button>
                    )}

                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-2">Contract Information</h3>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <p>Certificate System: {CERTIFICATE_SYSTEM_ADDRESS.slice(0, 6)}...{CERTIFICATE_SYSTEM_ADDRESS.slice(-4)}</p>
                                <p>NFT Certificate: {NFT_CERTIFICATE_ADDRESS.slice(0, 6)}...{NFT_CERTIFICATE_ADDRESS.slice(-4)}</p>
                                <p className="text-xs mt-2">Network: Avalanche Fuji Testnet (Chain ID: 43113)</p>
                            </div>
                        </CardContent>
                    </Card>

                    {isNFT && !isRegistered && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Register Organization for NFT Certificates</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="logoUrl">Logo URL *</Label>
                                        <Input
                                            id="logoUrl"
                                            value={formData.logoUrl}
                                            onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                                            placeholder="https://example.com/logo.png"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="brandColor">Brand Color *</Label>
                                        <Input
                                            id="brandColor"
                                            type="color"
                                            value={formData.brandColor}
                                            onChange={(e) => handleInputChange("brandColor", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button onClick={handleRegisterOrganization} className="w-full">
                                        Register Organization
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Issue New Certificate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Certificate Type</Label>
                                    <div className="flex space-x-4">
                                        <Button
                                            type="button"
                                            variant={isNFT ? "outline" : "default"}
                                            onClick={() => setIsNFT(false)}
                                        >
                                            Standard Certificate
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={isNFT ? "default" : "outline"}
                                            onClick={() => setIsNFT(true)}
                                        >
                                            NFT Certificate
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="document">Certificate Document (Optional)</Label>
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
                                        <div className="mt-2 p-2 bg-green-50 rounded border flex items-center">
                                            <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                                            <div className="text-sm">
                                                <p className="text-green-700">File uploaded successfully</p>
                                                <p className="text-muted-foreground text-xs">IPFS Hash: {uploadState.documentHash}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="recipientAddress">Recipient Address *</Label>
                                    <Input
                                        id="recipientAddress"
                                        value={formData.recipientAddress}
                                        onChange={(e) => handleInputChange("recipientAddress", e.target.value)}
                                        placeholder="0x..."
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="recipientName">Recipient Name *</Label>
                                    <Input
                                        id="recipientName"
                                        value={formData.recipientName}
                                        onChange={(e) => handleInputChange("recipientName", e.target.value)}
                                        placeholder="Full name of certificate recipient"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="certificateType">Certificate Type *</Label>
                                    <Input
                                        id="certificateType"
                                        value={formData.certificateType}
                                        onChange={(e) => handleInputChange("certificateType", e.target.value)}
                                        placeholder="e.g., Bachelor of Science, Professional Certificate"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="issueDate">Issue Date *</Label>
                                    <Input
                                        type="date"
                                        id="issueDate"
                                        value={formData.issueDate}
                                        onChange={(e) => handleInputChange("issueDate", e.target.value)}
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isIssuing || !walletState.isConnected || walletState.isConnecting || (isNFT && !isRegistered)}
                                    className="w-full"
                                >
                                    {isIssuing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Issuing Certificate...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Issue {isNFT ? "NFT" : ""} Certificate
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}