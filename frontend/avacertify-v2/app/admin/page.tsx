"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { certificateService } from "@/utils/blockchain";
import { CERTIFICATE_SYSTEM_ADDRESS, NFT_CERTIFICATE_ADDRESS } from "@/utils/contractConfig";
import { IPFSService } from "@/utils/ipfsService";
import { Certificate } from "@/lib/types";

interface UploadState {
  isUploading: boolean;
  documentHash: string;
  metadataHash: string;
  documentUrl: string;
}

export default function AdminPage() {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    documentHash: "",
    metadataHash: "",
    documentUrl: "",
  });
  const [isIssuing, setIsIssuing] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  let ipfsService: IPFSService;
  try {
    ipfsService = new IPFSService();
  } catch (error) {
    console.error("Failed to initialize IPFS service:", error);
    ipfsService = {
      checkApiKeys: () => false,
      generateMetadata: () => {
        throw new Error("IPFS service not properly configured");
      },
      uploadFile: async () => {
        throw new Error("IPFS service not properly configured");
      },
      uploadJSON: async () => {
        throw new Error("IPFS service not properly configured");
      },
      getGatewayUrl: (cid: string) => `https://gateway.pinata.cloud/ipfs/${cid}`,
    } as unknown as IPFSService;
  }

  useEffect(() => {
    const initBlockchain = async () => {
      try {
        await certificateService.init();
        const address = await certificateService.connectWallet();
        setWalletAddress(address);
        setIsConnected(true);
        toast({
          title: "Connected",
          description: "Wallet connected successfully",
        });
      } catch (error) {
        setWalletAddress(null);
        setIsConnected(false);
        toast({
          title: "Connection Error",
          description: error instanceof Error ? error.message : "Failed to connect wallet",
          variant: "destructive",
        });
      }
    };
    initBlockchain();
  }, [toast]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadState((prev) => ({ ...prev, isUploading: true }));
    try {
      const documentHash = await ipfsService.uploadFile(file);
      const documentUrl = ipfsService.getGatewayUrl(documentHash);
      setUploadState((prev) => ({ ...prev, documentHash, documentUrl }));
      toast({
        title: "File Uploaded",
        description: "Document successfully uploaded to IPFS",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploadState((prev) => ({ ...prev, isUploading: false }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsIssuing(true);

    try {
        const address = await certificateService.getConnectedAddress();
        if (!address) {
        throw new Error("Wallet not connected");
        }

        const form = event.currentTarget as HTMLFormElement;
        const formData = new FormData(form);
        const recipientAddress = formData.get("recipientAddress") as string;
        const recipientName = formData.get("recipientName") as string;
        const certificateType = formData.get("certificateType") as string;

        if (!recipientName || !recipientAddress || !certificateType) {
        throw new Error("Missing required fields");
        }

        const { documentHash, metadataHash } = uploadState;
        let metadataUri = "";
        if (documentHash) {
        const metadata = {
            name: `Certificate for ${recipientName}`,
            description: `${certificateType} certificate issued by AvaCertify`,
            image: ipfsService.getGatewayUrl(documentHash),
            attributes: [
            { trait_type: "Recipient", value: recipientName },
            { trait_type: "Type", value: certificateType },
            { trait_type: "Issue Date", value: new Date().toISOString() },
            { trait_type: "Issuer", value: "AvaCertify" },
            ],
        };
        const newMetadataHash = await ipfsService.uploadJSON(metadata);
        metadataUri = ipfsService.getGatewayUrl(newMetadataHash);
        setUploadState((prev) => ({ ...prev, metadataHash: newMetadataHash }));
        }

        toast({
        title: "Transaction Pending",
        description: "Please confirm the transaction in your wallet",
        });

        const certificateId = await certificateService.issueCertificate(recipientName, recipientAddress);
        if (!certificateId) {
        throw new Error("Failed to retrieve certificate ID");
        }

        const contract = await certificateService.getContract();
        // ethers v6: pass all method arguments, then overrides as the last argument
        const gasEstimate = await contract.estimateGas.issueCertificate(recipientName, recipientAddress);
        const txResponse = await (contract as any).issueCertificate(
          recipientName,
          recipientAddress,
          { gasLimit: Math.ceil(Number(gasEstimate) * 1.2) }
        );
        const receipt = await txResponse.wait();

        if (metadataHash && window.confirm("Would you like to mint an NFT certificate?")) {
        const tokenId = await certificateService.mintNFTCertificate(recipientAddress, metadataUri);
        console.log("NFT minted with token ID:", tokenId);
        }

        const newCertificate: Certificate = {
            id: certificateId,
            transactionHash: receipt.transactionHash,
            recipientName,
            recipientAddress,
            certificateType,
            issueDate: new Date().toISOString(),
            institutionName: "AvaCertify",
            status: "active",
            additionalDetails: metadataUri,
            certificateId: "",
            expirationDate: "",
            isRevoked: false
        };

        localStorage.setItem("certificates", JSON.stringify([
        ...JSON.parse(localStorage.getItem("certificates") || "[]"),
        newCertificate,
        ]));

        toast({
        title: "Certificate Issued",
        description: `Certificate ${certificateId} issued successfully. Transaction hash: ${receipt.transactionHash}`,
        });
    } catch (error: unknown) {
        let message = "Failed to issue certificate";
        if (error instanceof Error) {
        if (error.message.includes("user rejected")) {
            message = "User rejected the transaction";
        } else if (error.message.includes("insufficient funds")) {
            message = "Insufficient funds in your wallet";
        } else if (error.message.includes("network")) {
            message = "Please ensure you're connected to the Avalanche Fuji Testnet";
        } else if (error.message.includes("Contract or signer not initialized")) {
            message = "Wallet not connected. Please reconnect and try again.";
        } else {
            message = error.message;
        }
        }
        toast({
        title: "Error",
        description: message,
        variant: "destructive",
        });
    } finally {
        setUploadState({ isUploading: false, documentHash: "", metadataHash: "", documentUrl: "" });
        setIsIssuing(false);
    }
    };
  
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
                    <p className="text-sm text-muted-foreground">IPFS Hash: {uploadState.documentHash}</p>
                    <div className="text-sm text-blue-600">
                      <a href={uploadState.documentUrl} target="_blank" rel="noopener noreferrer">
                        View on IPFS Gateway
                      </a>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientAddress">Recipient Address</Label>
                <Input id="recipientAddress" name="recipientAddress" placeholder="0x..." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name</Label>
                <Input id="recipientName" name="recipientName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificateType">Certificate Type</Label>
                <Input id="certificateType" name="certificateType" required />
              </div>
              <Button type="submit" disabled={isIssuing || uploadState.isUploading || !isConnected}>
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
  );
}