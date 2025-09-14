"use client";

import React, { useState, useEffect } from "react";
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
  const [attachDocument, setAttachDocument] = useState(true);
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
      // auto-select the uploaded document for issuance
      setAttachDocument(true);
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

    // Ensure wallet is connected
    try {
      // Only connect wallet if not already connected to avoid unnecessary wallet UI prompts
      if (!isConnected) {
        await certificateService.connectWallet();
      }
    } catch (err: unknown) {
      console.error("Failed to connect wallet:", err);
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet before issuing a certificate.",
        variant: "destructive",
      });
      setIsIssuing(false);
      return;
    }

    const contract = await certificateService.getContract();

    if (!contract || typeof contract.issueCertificate !== 'function') {
      toast({
        title: "Contract Error",
        description: "Smart contract not initialized or missing issueCertificate method.",
        variant: "destructive",
      });
      setIsIssuing(false);
      return;
    }

    try {
      const address = await certificateService.getConnectedAddress();
      if (!address) {
        throw new Error("Wallet not connected");
      }

      // Guarded Form element retrieval to avoid "FormData constructor: Argument 1 is not an object"
      const formEl = (event.currentTarget as HTMLFormElement) ?? ((event.target as HTMLElement)?.closest?.('form') as HTMLFormElement | null);
      if (!formEl) {
        toast({ title: "Form Error", description: "Unable to read form data.", variant: "destructive" });
        setIsIssuing(false);
        return;
      }
      const formData = new FormData(formEl);
      const recipientAddress = formData.get("recipientAddress") as string;
      const recipientName = formData.get("recipientName") as string;
      const certificateType = formData.get("certificateType") as string;

      if (!recipientName || !recipientAddress || !certificateType) {
        throw new Error("Missing required fields");
      }

      const {documentHash, metadataHash} = uploadState;
      let metadataUri = "";
      if (documentHash && attachDocument) {
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

      // call the service method (service already handles contract interaction)
      const certificateId = await certificateService.issueCertificate(recipientName, recipientAddress);
      if (!certificateId) {
        throw new Error("Failed to retrieve certificate ID");
      }

      if (metadataHash && window.confirm("Would you like to mint an NFT certificate?")) {
        const tokenId = await certificateService.mintNFTCertificate(recipientAddress, metadataUri);
        console.log("NFT minted with token ID:", tokenId);
      }

      const newCertificate: Certificate = {
        id: certificateId,
        transactionHash: "",
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
        description: `Certificate ${certificateId} issued successfully.`,
      });
    } catch (error: unknown) {
      console.error("Issue certificate failed:", error);
      toast({
        title: "Issue Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    } finally {
      setUploadState({ isUploading: false, documentHash: "", metadataHash: "", documentUrl: "" });
      setIsIssuing(false);
    }
  };
  
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-4xl py-10">
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
                  name="document"
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

                    <label className="flex items-center space-x-2 mt-2">
                      <input
                        type="checkbox"
                        checked={attachDocument}
                        onChange={(e) => setAttachDocument(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Attach uploaded document to this certificate</span>
                    </label>

                    {/* include documentHash in form submission only when selected */}
                    {attachDocument && (
                      <input type="hidden" name="documentHash" value={uploadState.documentHash} />
                    )}
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
      </div>
    </Layout>
  );
}