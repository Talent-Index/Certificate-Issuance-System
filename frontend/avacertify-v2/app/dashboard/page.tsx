"use client";

import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PlusCircle, FileText, Copy, ExternalLink, Loader2, Upload, CheckCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { useToast } from "@/hooks/use-toast";
import { Certificate, certificateService } from "@/utils/blockchain";
import { IPFSService } from "@/utils/ipfsService";
import { AVALANCHE_FUJI_CONFIG } from "@/utils/contractConfig";
import { ethers } from "ethers";

const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), { ssr: false });

export default function Dashboard() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [isNFT, setIsNFT] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    documentHash: "",
    metadataHash: "",
    documentUrl: "",
  });
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientAddress: "",
    certificateType: "",
    issueDate: "",
    expirationDate: "",
    additionalDetails: "",
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

  const fetchCertificates = useCallback(async () => {
    try {
      await checkNetwork();
      const storedCertificates = JSON.parse(localStorage.getItem("certificates") || "[]") as Certificate[];
      const blockchainCertificates: Certificate[] = [];
      for (const cert of storedCertificates) {
        const blockchainCert = await certificateService.getCertificate(cert.id, cert.isNFT || false);
        if (blockchainCert) {
          blockchainCertificates.push({ ...blockchainCert, transactionHash: cert.transactionHash });
        }
      }
      setCertificates(blockchainCertificates);
      localStorage.setItem("certificates", JSON.stringify(blockchainCertificates));
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch certificates",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    const initBlockchain = async () => {
      try {
        await certificateService.init();
        const address = await certificateService.getConnectedAddress();
        if (address) {
          setIsConnected(true);
          await checkNetwork();
          const registered = await certificateService.isOrganizationRegistered();
          setIsRegistered(registered);
          toast({
            title: "Connected",
            description: `Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
          });
          fetchCertificates();
        }
      } catch (error) {
        setIsConnected(false);
        toast({
          title: "Connection Error",
          description: error instanceof Error ? error.message : "Failed to connect wallet",
          variant: "destructive",
        });
      }
    };
    initBlockchain();
  }, [toast, fetchCertificates, checkNetwork]);

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
    } catch (error: any) {
      setUploadState((prev) => ({ ...prev, isUploading: false }));
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file to IPFS",
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
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register organization",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const handleIssueCertificate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isConnected) {
      toast({
        title: "Connection Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      await checkNetwork();
      const { recipientName, recipientAddress, certificateType, issueDate, expirationDate, additionalDetails, institutionName } = formData;

      if (!recipientName || !recipientAddress || !certificateType || !issueDate || !institutionName) {
        throw new Error("Missing required fields");
      }

      if (!ethers.isAddress(recipientAddress)) {
        throw new Error("Invalid recipient address");
      }

      if (recipientName.length > 100) {
        throw new Error("Recipient name too long (max 100 characters)");
      }

      if (isNFT && !isRegistered) {
        throw new Error("Organization not registered. Please register first.");
      }

      if (!isNFT) {
        const hasRole = await certificateService.hasIssuerRole();
        if (!hasRole) {
          throw new Error("Wallet does not have ISSUER_ROLE. Contact admin to grant role.");
        }
      }

      setIsIssuing(true);
      toast({
        title: "Transaction Pending",
        description: "Please confirm the transaction in your wallet",
      });

      let certificateId: string;
      if (isNFT) {
        const metadata = ipfsService.generateMetadata(
          certificateType,
          "Certificate issued by AvaCertify",
          uploadState.documentHash,
          formData.brandColor,
          institutionName
        );
        const metadataHash = await ipfsService.uploadJSON(metadata);
        certificateId = await certificateService.mintNFTCertificate(recipientAddress, ipfsService.getGatewayUrl(metadataHash));
      } else {
        certificateId = await certificateService.issueCertificate(recipientName, recipientAddress);
      }

      if (!certificateId) {
        throw new Error("Failed to retrieve certificate ID");
      }

      const newCertificate: Certificate = {
        id: certificateId,
        certificateId,
        recipientName,
        recipientAddress,
        certificateType,
        issueDate,
        expirationDate: expirationDate || undefined,
        institutionName,
        status: "active",
        additionalDetails,
        documentHash: uploadState.documentHash,
        documentUrl: uploadState.documentUrl,
        isNFT,
      };

      setCertificates((prev) => [...prev, newCertificate]);
      localStorage.setItem("certificates", JSON.stringify([...certificates, newCertificate]));

      toast({
        title: isNFT ? "NFT Certificate Issued" : "Certificate Issued",
        description: `Certificate ${certificateId} issued successfully to ${recipientName}`,
      });

      setFormData({
        recipientName: "",
        recipientAddress: "",
        certificateType: "",
        issueDate: "",
        expirationDate: "",
        additionalDetails: "",
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
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      let message = isNFT ? "Failed to mint NFT certificate" : "Failed to issue certificate";
      if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        message = "User rejected the transaction";
      } else if (error.message?.includes("insufficient funds")) {
        message = "Insufficient AVAX for gas fees. Get test AVAX from faucet.";
      } else if (error.message?.includes("network")) {
        message = "Please ensure you're connected to the Avalanche Fuji Testnet";
      } else if (error.message?.includes("not authorized") || error.message?.includes("ISSUER_ROLE")) {
        message = "Wallet not authorized to issue certificates. Contact admin.";
      } else if (error.message?.includes("not registered")) {
        message = "Organization not registered. Please register first.";
      } else if (error.message?.includes("CALL_EXCEPTION")) {
        message = "Transaction failed: Likely unauthorized issuer or invalid parameters.";
      }
      toast({
        title: "Error",
        description: error.message || message,
        variant: "destructive",
      });
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Certificate Dashboard</h1>
        <Tabs defaultValue="issue" className="space-y-6">
          <TabsList>
            <TabsTrigger value="issue">Issue Certificate</TabsTrigger>
            <TabsTrigger value="view">View Certificates</TabsTrigger>
          </TabsList>
          <TabsContent value="issue">
            <Card>
              <CardHeader>
                <CardTitle>Issue New Certificate</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleIssueCertificate} className="space-y-4">
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

                  {isNFT && !isRegistered && (
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
                  )}

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
                    <Label htmlFor="recipientName">Recipient Name *</Label>
                    <Input
                      id="recipientName"
                      value={formData.recipientName}
                      onChange={(e) => handleInputChange("recipientName", e.target.value)}
                      placeholder="Full name"
                      required
                    />
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
                    <Label htmlFor="certificateType">Certificate Type *</Label>
                    <Input
                      id="certificateType"
                      value={formData.certificateType}
                      onChange={(e) => handleInputChange("certificateType", e.target.value)}
                      placeholder="e.g., Bachelor of Science"
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
                  <div className="space-y-2">
                    <Label htmlFor="expirationDate">Expiration Date (Optional)</Label>
                    <Input
                      type="date"
                      id="expirationDate"
                      value={formData.expirationDate}
                      onChange={(e) => handleInputChange("expirationDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institutionName">Institution Name *</Label>
                    <Input
                      id="institutionName"
                      value={formData.institutionName}
                      onChange={(e) => handleInputChange("institutionName", e.target.value)}
                      placeholder="e.g., AvaCertify"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="additionalDetails">Additional Details (Optional)</Label>
                    <Textarea
                      id="additionalDetails"
                      value={formData.additionalDetails}
                      onChange={(e) => handleInputChange("additionalDetails", e.target.value)}
                      placeholder="Additional certificate information"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isIssuing || !isConnected || (isNFT && !isRegistered)}
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
          </TabsContent>
          <TabsContent value="view">
            <Card>
              <CardHeader>
                <CardTitle>Issued Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                {certificates.length === 0 ? (
                  <p className="text-muted-foreground">No certificates issued yet.</p>
                ) : (
                  <div className="space-y-4">
                    {certificates.map((cert) => (
                      <MotionDiv
                        key={cert.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => {
                            setSelectedCertificate(cert);
                            setIsDialogOpen(true);
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-semibold">{cert.certificateType}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Issued to: {cert.recipientName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Status: {cert.status}
                                </p>
                              </div>
                              <FileText className="h-6 w-6 text-primary" />
                            </div>
                          </CardContent>
                        </Card>
                      </MotionDiv>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Certificate Details</DialogTitle>
              <DialogDescription>
                Detailed information about the selected certificate.
              </DialogDescription>
            </DialogHeader>
            {selectedCertificate && (
              <div className="space-y-4">
                <div>
                  <Label>Certificate ID</Label>
                  <div className="flex items-center space-x-2">
                    <p>{selectedCertificate.id}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedCertificate.id, "Certificate ID")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Recipient Name</Label>
                  <p>{selectedCertificate.recipientName}</p>
                </div>
                <div>
                  <Label>Recipient Address</Label>
                  <div className="flex items-center space-x-2">
                    <p>{selectedCertificate.recipientAddress}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(selectedCertificate.recipientAddress, "Recipient Address")
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Certificate Type</Label>
                  <p>{selectedCertificate.certificateType}</p>
                </div>
                <div>
                  <Label>Issue Date</Label>
                  <p>{new Date(selectedCertificate.issueDate).toLocaleDateString()}</p>
                </div>
                {selectedCertificate.expirationDate && (
                  <div>
                    <Label>Expiration Date</Label>
                    <p>{new Date(selectedCertificate.expirationDate).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <Label>Institution Name</Label>
                  <p>{selectedCertificate.institutionName}</p>
                </div>
                {selectedCertificate.additionalDetails && (
                  <div>
                    <Label>Additional Details</Label>
                    <p>{selectedCertificate.additionalDetails}</p>
                  </div>
                )}
                {selectedCertificate.documentUrl && (
                  <div>
                    <Label>Document</Label>
                    <div className="flex items-center space-x-2">
                      <a
                        href={selectedCertificate.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Document
                      </a>
                      <ExternalLink className="h-4 w-4" />
                    </div>
                  </div>
                )}
                {selectedCertificate.transactionHash && (
                  <div>
                    <Label>Transaction Hash</Label>
                    <div className="flex items-center space-x-2">
                      <p>{selectedCertificate.transactionHash}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(selectedCertificate.transactionHash!, "Transaction Hash")
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}