"use client"

import { useState } from "react"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, Loader2, Award, Calendar, Building, AlertTriangle, ExternalLink, Copy } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { certificateService } from "@/utils/blockchain"

interface Certificate {
  id: string;
  certificateId?: string;
  certificateType: string;
  recipientName: string;
  recipientAddress: string;
  issueDate: string;
  expirationDate?: string;
  institutionName: string;
  status: "active" | "revoked";
  additionalDetails?: string;
  transactionHash?: string;
  documentHash?: string;
  documentUrl?: string;
  isNFT?: boolean;
}

type VerificationStatus = "idle" | "loading" | "valid" | "invalid" | "revoked"

export default function Verify() {
  const [certificateId, setCertificateId] = useState("")
  const [tokenId, setTokenId] = useState("")
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("idle")
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [verificationType, setVerificationType] = useState<"standard" | "nft">("standard")
  const { toast } = useToast()

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const handleVerify = async (isNFT: boolean) => {
    const id = isNFT ? tokenId : certificateId;
    
    if (!id) {
      toast({
        title: "Error",
        description: `Please enter a ${isNFT ? 'token ID' : 'certificate ID'}`,
        variant: "destructive",
      });
      return;
    }

    setVerificationStatus("loading");
    
    try {
      await certificateService.init();
      
      const isValid = await certificateService.verifyCertificate(id, isNFT);
      const cert = await certificateService.getCertificate(id, isNFT);
      
      if (cert && isValid) {
        setCertificate({ ...cert, isNFT });
        setVerificationStatus(cert.status === "revoked" ? "revoked" : "valid");
        
        toast({
          title: cert.status === "revoked" ? "Certificate Revoked" : "Certificate Valid",
          description: cert.status === "revoked" 
            ? `${isNFT ? 'NFT certificate' : 'Certificate'} has been revoked`
            : `${isNFT ? 'NFT certificate' : 'Certificate'} is valid and active`,
          variant: cert.status === "revoked" ? "destructive" : "default",
        });
      } else {
        setCertificate(null);
        setVerificationStatus("invalid");
        
        toast({
          title: "Not Found",
          description: `${isNFT ? 'NFT certificate' : 'Certificate'} not found or invalid`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setCertificate(null);
      setVerificationStatus("invalid");
      
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify certificate",
        variant: "destructive",
      });
    }
    
    setIsDialogOpen(true);
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container py-10"
      >
        <h1 className="text-3xl font-bold mb-6">Verify Certificate</h1>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Verify Certificate</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="standard" onValueChange={(value) => setVerificationType(value as "standard" | "nft")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="standard">Standard Certificate</TabsTrigger>
                <TabsTrigger value="nft">NFT Certificate</TabsTrigger>
              </TabsList>
              
              <TabsContent value="standard" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="certificateId">Certificate ID</Label>
                  <Input
                    id="certificateId"
                    type="text"
                    placeholder="Enter certificate ID"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => handleVerify(false)} 
                  className="w-full" 
                  disabled={verificationStatus === "loading"}
                >
                  {verificationStatus === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Standard Certificate"
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="nft" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tokenId">Token ID</Label>
                  <Input
                    id="tokenId"
                    type="text"
                    placeholder="Enter NFT token ID"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => handleVerify(true)} 
                  className="w-full" 
                  disabled={verificationStatus === "loading"}
                >
                  {verificationStatus === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify NFT Certificate"
                  )}
                </Button>
              </TabsContent>
            </Tabs>

            <AnimatePresence mode="wait">
              {verificationStatus !== "idle" && verificationStatus !== "loading" && (
                <motion.div
                  key={verificationStatus}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6"
                >
                  {verificationStatus === "valid" && certificate && (
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center text-green-500">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        <span>Certificate is valid</span>
                      </div>
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="font-semibold text-lg mb-4 flex items-center justify-center">
                            <Award className="mr-2 h-5 w-5 text-primary" />
                            {certificate.certificateType}
                          </h3>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground flex items-center justify-center">
                              <Building className="mr-2 h-4 w-4" />
                              Recipient: {certificate.recipientName}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center justify-center">
                              <Calendar className="mr-2 h-4 w-4" />
                              Issued: {certificate.issueDate}
                            </p>
                            {certificate.expirationDate && (
                              <p className="text-sm text-muted-foreground flex items-center justify-center">
                                <Calendar className="mr-2 h-4 w-4" />
                                Expires: {certificate.expirationDate}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground flex items-center justify-center">
                              Institution: {certificate.institutionName}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center justify-center">
                              {certificate.isNFT ? 'Token ID' : 'Certificate ID'}: {certificate.certificateId || certificate.id}
                            </p>
                            {certificate.isNFT && (
                              <p className="text-xs text-muted-foreground flex items-center justify-center mt-2">
                                <Award className="mr-1 h-3 w-3" />
                                NFT Certificate
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  {verificationStatus === "invalid" && (
                    <div className="flex items-center justify-center text-red-500">
                      <XCircle className="mr-2 h-5 w-5" />
                      <span>Certificate is invalid or not found</span>
                    </div>
                  )}
                  {verificationStatus === "revoked" && certificate && (
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center text-yellow-500">
                        <AlertTriangle className="mr-2 h-5 w-5" />
                        <span>Certificate has been revoked</span>
                      </div>
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="font-semibold text-lg mb-4 flex items-center justify-center">
                            <Award className="mr-2 h-5 w-5 text-primary" />
                            {certificate.certificateType}
                          </h3>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground flex items-center justify-center">
                              <Building className="mr-2 h-4 w-4" />
                              Recipient: {certificate.recipientName}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center justify-center">
                              {certificate.isNFT ? 'Token ID' : 'Certificate ID'}: {certificate.certificateId || certificate.id}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Certificate Verification Result</DialogTitle>
            <DialogDescription>
              {verificationStatus === "valid" && "The certificate is valid."}
              {verificationStatus === "invalid" && "The certificate is invalid or not found."}
              {verificationStatus === "revoked" && "The certificate has been revoked."}
            </DialogDescription>
          </DialogHeader>
          {certificate && (
            <div className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-4">
                    {verificationStatus === "valid" && <CheckCircle className="h-12 w-12 text-green-500" />}
                    {verificationStatus === "invalid" && <XCircle className="h-12 w-12 text-red-500" />}
                    {verificationStatus === "revoked" && <AlertTriangle className="h-12 w-12 text-yellow-500" />}
                  </div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center justify-center">
                    <Award className="mr-2 h-5 w-5 text-primary" />
                    {certificate.certificateType}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Recipient Name</Label>
                      <p className="text-sm">{certificate.recipientName}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Recipient Address</Label>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm truncate">{certificate.recipientAddress}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(certificate.recipientAddress, "Recipient Address")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Issue Date</Label>
                      <p className="text-sm">{certificate.issueDate}</p>
                    </div>
                    {certificate.expirationDate && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Expiration Date</Label>
                        <p className="text-sm">{certificate.expirationDate}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs text-muted-foreground">Institution</Label>
                      <p className="text-sm">{certificate.institutionName}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        {certificate.isNFT ? 'Token ID' : 'Certificate ID'}
                      </Label>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm">{certificate.certificateId || certificate.id}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(certificate.certificateId || certificate.id, certificate.isNFT ? "Token ID" : "Certificate ID")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {certificate.isNFT && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Award className="mr-1 h-3 w-3" />
                          This is an NFT Certificate
                        </p>
                      </div>
                    )}
                    {certificate.additionalDetails && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Additional Details</Label>
                        <p className="text-sm">{certificate.additionalDetails}</p>
                      </div>
                    )}
                    {certificate.documentUrl && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Document</Label>
                        <a
                          href={certificate.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center"
                        >
                          View Document
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  )
}