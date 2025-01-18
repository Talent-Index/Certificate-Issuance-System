'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import { Toaster, toast } from 'react-hot-toast'
import { certificateService } from '../../utils/contractinteraction'

interface CertificateForm {
  recipientName: string;
  recipientEmail: string;
  certificateDetails: string;
}

export default function IssuerDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [certificateId, setCertificateId] = useState('')
  const [isWaitlisted, setIsWaitlisted] = useState(true)
  const [formData, setFormData] = useState<CertificateForm>({
    recipientName: '',
    recipientEmail: '',
    certificateDetails: ''
  })

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const address = await certificateService.getConnectedAddress();
        if (!address) {
          router.push('/');
        }
      } catch (err) {
        console.error('Connection error:', err);
        router.push('/');
      }
    };

    checkConnection();
  }, [router]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true);
    try {
      const txId = await certificateService.issueCertificate(formData.recipientName);
      toast.success(`Certificate issued successfully! ID: ${txId}`);
      setFormData({
        recipientName: '',
        recipientEmail: '',
        certificateDetails: ''
      });
    } catch (err) {
      console.error('Issue certificate error:', err);
      toast.error('Failed to issue certificate');
    } finally {
      setIsLoading(false);
    }
  }

  const handleVerifyCertificate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true);
    try {
      const isValid = await certificateService.verifyCertificate(certificateId);
      toast.success(`Certificate is ${isValid ? 'valid' : 'invalid'}`);
    } catch (err) {
      console.error('Verify certificate error:', err);
      toast.error('Failed to verify certificate');
    } finally {
      setIsLoading(false);
    }
  }

  const handleRevokeCertificate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true);
    try {
      await certificateService.revokeCertificate(certificateId);
      toast.success('Certificate revoked successfully');
    } catch (err) {
      console.error('Revoke certificate error:', err);
      toast.error('Failed to revoke certificate');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isWaitlisted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-white to-blue-600">
      <Navbar isWaitlisted={isWaitlisted} />
      <Toaster position="top-right" />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Issuer Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Issue Certificate</h2>
            <form onSubmit={handleIssueCertificate} className="space-y-4">
              <div>
                <label htmlFor="recipientName" className="block mb-1">Recipient Name</label>
                <input
                  type="text"
                  id="recipientName"
                  value={formData.recipientName}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label htmlFor="recipientEmail" className="block mb-1">Recipient Email</label>
                <input
                  type="email"
                  id="recipientEmail"
                  value={formData.recipientEmail}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label htmlFor="certificateDetails" className="block mb-1">Certificate Details</label>
                <textarea
                  id="certificateDetails"
                  value={formData.certificateDetails}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? "Processing..." : "Issue Certificate"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Verify Certificate</h2>
            <form onSubmit={handleVerifyCertificate} className="space-y-4">
              <div>
                <label htmlFor="certificateId" className="block mb-1">Certificate ID</label>
                <input
                  type="text"
                  id="certificateId"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? "Processing..." : "Verify Certificate"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Revoke Certificate</h2>
            <form onSubmit={handleRevokeCertificate} className="space-y-4">
              <div>
                <label htmlFor="revokeCertificateId" className="block mb-1">Certificate ID</label>
                <input
                  type="text"
                  id="revokeCertificateId"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? "Processing..." : "Revoke Certificate"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}