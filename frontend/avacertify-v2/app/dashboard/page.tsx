"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { PlusCircle, FileText, Copy, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { type Certificate, placeholderCertificates } from "@/lib/types"

export default function Dashboard() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const storedCertificates = localStorage.getItem("certificates")
    if (storedCertificates) {
      setCertificates(JSON.parse(storedCertificates))
    } else {
      setCertificates(placeholderCertificates)
      localStorage.setItem("certificates", JSON.stringify(placeholderCertificates))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("certificates", JSON.stringify(certificates))
  }, [certificates])

  const handleIssueCertificate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const certificateId = `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    const transactionHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join("")}`
    const newCertificate: Certificate = {
      id: Date.now().toString(),
      certificateId,
      transactionHash,
      recipientName: formData.get("recipientName") as string,
      recipientAddress: formData.get("recipientAddress") as string,
      certificateType: formData.get("certificateType") as string,
      issueDate: formData.get("issueDate") as string,
      expirationDate: (formData.get("expirationDate") as string) || "",
      additionalDetails: formData.get("additionalDetails") as string,
      isRevoked: false,
      institutionName: formData.get("institutionName") as string,
    }
    setCertificates((prevCertificates) => [...prevCertificates, newCertificate])
    toast({
      title: "Certificate Issued",
      description: `Certificate ${certificateId} issued to ${newCertificate.recipientName}`,
    })
    event.currentTarget.reset()
  }

  const revokeCertificate = (certificateId: string) => {
    setCertificates((prevCertificates) =>
      prevCertificates.map((cert) => (cert.certificateId === certificateId ? { ...cert, isRevoked: true } : cert)),
    )
    toast({
      title: "Certificate Revoked",
      description: `Certificate ${certificateId} has been revoked`,
      variant: "destructive",
    })
  }

  const viewCertificateDetails = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setIsDialogOpen(true)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied to your clipboard.`,
    })
  }

  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Institution Dashboard</h1>
        <Tabs defaultValue="issue">
          <TabsList className="mb-6">
            <TabsTrigger value="issue">Issue Certificate</TabsTrigger>
            <TabsTrigger value="manage">Manage Certificates</TabsTrigger>
          </TabsList>
          <TabsContent value="issue">
            <Card>
              <CardHeader>
                <CardTitle>Issue New Certificate</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleIssueCertificate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipientName">Recipient Name</Label>
                      <Input id="recipientName" name="recipientName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipientAddress">Recipient Address</Label>
                      <Input id="recipientAddress" name="recipientAddress" placeholder="0x..." required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institutionName">Institution Name</Label>
                    <Input id="institutionName" name="institutionName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="certificateType">Certificate Type</Label>
                    <Select name="certificateType" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select certificate type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic Degree</SelectItem>
                        <SelectItem value="professional">Professional Certification</SelectItem>
                        <SelectItem value="training">Training Completion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="issueDate">Issue Date</Label>
                      <Input type="date" id="issueDate" name="issueDate" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expirationDate">Expiration Date (if applicable)</Label>
                      <Input type="date" id="expirationDate" name="expirationDate" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="additionalDetails">Additional Details</Label>
                    <Textarea
                      id="additionalDetails"
                      name="additionalDetails"
                      placeholder="Enter any additional information about the certificate..."
                    />
                  </div>
                  <Button type="submit">
                    <PlusCircle className="mr-2 h-4 w-4" /> Issue Certificate
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="manage">
            <div className="space-y-4">
              {certificates.map((cert) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={cert.isRevoked ? "border-red-500" : ""}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            {cert.certificateType}
                          </h3>
                          <p className="text-sm text-muted-foreground">Recipient: {cert.recipientName}</p>
                          <p className="text-sm text-muted-foreground">Institution: {cert.institutionName}</p>
                          <p className="text-sm text-muted-foreground">Issued: {cert.issueDate}</p>
                          {cert.isRevoked && <p className="text-sm font-semibold text-red-500">REVOKED</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => viewCertificateDetails(cert)}>
                            View Details
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => revokeCertificate(cert.certificateId)}
                            disabled={cert.isRevoked}
                          >
                            {cert.isRevoked ? "Revoked" : "Revoke"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Certificate Details</DialogTitle>
            <DialogDescription>Detailed information about the selected certificate.</DialogDescription>
          </DialogHeader>
          {selectedCertificate && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Recipient
                </Label>
                <Input id="name" value={selectedCertificate.recipientName} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="institution" className="text-right">
                  Institution
                </Label>
                <Input id="institution" value={selectedCertificate.institutionName} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Input id="type" value={selectedCertificate.certificateType} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="issue-date" className="text-right">
                  Issued
                </Label>
                <Input id="issue-date" value={selectedCertificate.issueDate} className="col-span-3" readOnly />
              </div>
              {selectedCertificate.expirationDate && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expiration-date" className="text-right">
                    Expires
                  </Label>
                  <Input
                    id="expiration-date"
                    value={selectedCertificate.expirationDate}
                    className="col-span-3"
                    readOnly
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cert-id" className="text-right">
                  Certificate ID
                </Label>
                <div className="col-span-3 flex">
                  <Input id="cert-id" value={selectedCertificate.certificateId} className="flex-grow" readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-2"
                    onClick={() => copyToClipboard(selectedCertificate.certificateId, "Certificate ID")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tx-hash" className="text-right">
                  Transaction Hash
                </Label>
                <div className="col-span-3 flex">
                  <Input id="tx-hash" value={selectedCertificate.transactionHash} className="flex-grow" readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-2"
                    onClick={() => copyToClipboard(selectedCertificate.transactionHash, "Transaction Hash")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-2"
                    onClick={() =>
                      window.open(`https://testnet.snowtrace.io/tx/${selectedCertificate.transactionHash}`, "_blank")
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Input
                  id="status"
                  value={selectedCertificate.isRevoked ? "Revoked" : "Verified"}
                  className={`col-span-3 ${selectedCertificate.isRevoked ? "text-red-500" : "text-green-500"}`}
                  readOnly
                />
              </div>
              {selectedCertificate.additionalDetails && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="details" className="text-right">
                    Additional Details
                  </Label>
                  <Textarea
                    id="details"
                    value={selectedCertificate.additionalDetails}
                    className="col-span-3"
                    readOnly
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  )
}

