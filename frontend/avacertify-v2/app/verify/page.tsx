"use client"

import { useState } from "react"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, Loader2, Award, Calendar, Building, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Certificate {
  certificateId: string
  certificateType: string
  recipientName: string
  issueDate: string
  expirationDate?: string
  isRevoked: boolean
}

type VerificationStatus = "idle" | "loading" | "valid" | "invalid" | "revoked"

export default function Verify() {
  const [certificateId, setCertificateId] = useState("")
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("idle")
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleVerify = async () => {
    if (!certificateId) {
      toast({
        title: "Error",
        description: "Please enter a certificate ID",
        variant: "destructive",
      })
      return
    }

    setVerificationStatus("loading")
    // Simulating API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const storedCertificates = JSON.parse(localStorage.getItem("certificates") || "[]")
    const foundCertificate = storedCertificates.find((cert: Certificate) => cert.certificateId === certificateId)

    if (foundCertificate) {
      setCertificate(foundCertificate)
      setVerificationStatus(foundCertificate.isRevoked ? "revoked" : "valid")
    } else {
      setCertificate(null)
      setVerificationStatus("invalid")
    }

    setIsDialogOpen(true)
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container py-10"
      >
        <h1 className="text-3xl font-bold mb-6">Verify Certificate</h1>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Enter Certificate ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Certificate ID"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
              />
              <Button onClick={handleVerify} className="w-full" disabled={verificationStatus === "loading"}>
                {verificationStatus === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Certificate"
                )}
              </Button>
            </div>
            <AnimatePresence mode="wait">
              {verificationStatus !== "idle" && (
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
                          <p className="text-sm text-muted-foreground flex items-center justify-center mb-2">
                            <Building className="mr-2 h-4 w-4" />
                            Recipient: {certificate.recipientName}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center justify-center mb-2">
                            <Calendar className="mr-2 h-4 w-4" />
                            Issued: {certificate.issueDate}
                          </p>
                          {certificate.expirationDate && (
                            <p className="text-sm text-muted-foreground flex items-center justify-center mb-2">
                              <Calendar className="mr-2 h-4 w-4" />
                              Expires: {certificate.expirationDate}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground flex items-center justify-center">
                            Certificate ID: {certificate.certificateId}
                          </p>
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
                  {verificationStatus === "revoked" && (
                    <div className="flex items-center justify-center text-yellow-500">
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      <span>Certificate has been revoked</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
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
                  <p className="text-sm text-muted-foreground flex items-center justify-center mb-2">
                    <Building className="mr-2 h-4 w-4" />
                    Recipient: {certificate.recipientName}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center justify-center mb-2">
                    <Calendar className="mr-2 h-4 w-4" />
                    Issued: {certificate.issueDate}
                  </p>
                  {certificate.expirationDate && (
                    <p className="text-sm text-muted-foreground flex items-center justify-center mb-2">
                      <Calendar className="mr-2 h-4 w-4" />
                      Expires: {certificate.expirationDate}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground flex items-center justify-center">
                    Certificate ID: {certificate.certificateId}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  )
}

