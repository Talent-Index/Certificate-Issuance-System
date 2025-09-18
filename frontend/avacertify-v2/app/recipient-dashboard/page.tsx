"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { certificateService } from "@/utils/blockchain";

export default function RecipientDashboard() {
  const router = useRouter();
  const [certificateId, setCertificateId] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [certificates, setCertificates] = useState<any[]>([]);

  // Check if user is on waitlist
  const isWaitlisted = localStorage.getItem("isWaitlisted") === "true";

  useEffect(() => {
    if (!isWaitlisted) {
      router.push("/");
      return;
    }

    // Load user's certificates
    const loadCertificates = async () => {
      try {
        // This would typically fetch certificates for the current user
        const userCertificates = await certificateService.getCertificate("user-certificates");
        setCertificates(Array.isArray(userCertificates) ? userCertificates : userCertificates ? [userCertificates] : []);
      } catch (error) {
        console.error("Failed to load certificates:", error);
      }
    };

    loadCertificates();
  }, [isWaitlisted, router]);

  const handleVerifyCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isValid = await certificateService.verifyCertificate(certificateId);
      if (isValid) {
        toast.success("Certificate verified successfully!");
      } else {
        toast.error("Certificate verification failed!");
      }
    } catch (error) {
      toast.error("Error verifying certificate");
    }
  };

  const handleTransferCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate recipient address format
      if (!recipientAddress.startsWith("0x") || recipientAddress.length !== 42) {
        toast.error("Invalid recipient address format");
        return;
      }

      const success = await certificateService.transferCertificate(certificateId, recipientAddress);
      if (success) {
        toast.success("Certificate transferred successfully!");
        setCertificateId("");
        setRecipientAddress("");
      } else {
        toast.error("Certificate transfer failed!");
      }
    } catch (error) {
      toast.error("Error transferring certificate");
    }
  };

  if (!isWaitlisted) {
    return null; // Will redirect
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-4xl py-10">
          <h1 className="text-3xl font-bold mb-6 text-center">Recipient Dashboard</h1>

          <div className="grid gap-6 md:grid-cols-2">
            {/* My Certificates */}
            <Card>
              <CardHeader>
                <CardTitle>My Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                {certificates.length > 0 ? (
                  <div className="space-y-4">
                    {certificates.map((cert, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h3 className="font-semibold">{cert.recipientName || "Certificate"}</h3>
                        <p className="text-sm text-gray-600">ID: {cert.id}</p>
                        <p className="text-sm text-gray-600">Status: {cert.status || "Active"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No certificates found</p>
                )}
              </CardContent>
            </Card>

            {/* Verify Certificate */}
            <Card>
              <CardHeader>
                <CardTitle>Verify Certificate</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerifyCertificate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verify-id">Certificate ID</Label>
                    <Input
                      id="verify-id"
                      type="text"
                      placeholder="Enter certificate ID"
                      value={certificateId}
                      onChange={(e) => setCertificateId(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Verify Certificate
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Transfer Certificate */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Transfer Certificate</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTransferCertificate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="transfer-id">Certificate ID</Label>
                      <Input
                        id="transfer-id"
                        type="text"
                        placeholder="Enter certificate ID"
                        value={certificateId}
                        onChange={(e) => setCertificateId(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipient-address">Recipient Address</Label>
                      <Input
                        id="recipient-address"
                        type="text"
                        placeholder="0x..."
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Transfer Certificate
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
