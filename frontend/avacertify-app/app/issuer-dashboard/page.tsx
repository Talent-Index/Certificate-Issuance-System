'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import { Toaster, toast } from 'react-hot-toast'

export default function IssuerDashboard() {
  const router = useRouter()
  const [certificateId, setCertificateId] = useState('')

  // In a real application, you would check the waitlist status from a backend or local storage
  const isWaitlisted = true // This is a placeholder. Replace with actual logic.

  if (!isWaitlisted) {
    router.push('/')
    return null
  }

  const handleIssueCertificate = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    toast.success('Certificate issued successfully!')
  }

  const handleVerifyCertificate = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    toast.success('Certificate verified successfully!')
  }

  const handleRevokeCertificate = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    toast.success('Certificate revoked successfully!')
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
                <input type="text" id="recipientName" required className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label htmlFor="recipientEmail" className="block mb-1">Recipient Email</label>
                <input type="email" id="recipientEmail" required className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label htmlFor="certificateDetails" className="block mb-1">Certificate Details</label>
                <textarea id="certificateDetails" required className="w-full px-3 py-2 border rounded"></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
                Issue Certificate
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
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
                Verify Certificate
              </button>
            </form>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Revoke Certificate</h2>
            <form onSubmit={handleRevokeCertificate} className="space-y-4">
              <div>
                <label htmlFor="revokeCertificateId" className="block mb-1">Certificate ID</label>
                <input type="text" id="revokeCertificateId" required className="w-full px-3 py-2 border rounded" />
              </div>
              <button type="submit" className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors">
                Revoke Certificate
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
