'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import { Toaster, toast } from 'react-hot-toast'
import { certificateService, Certificate } from '../../utils/blockchain'

export default function RecipientDashboard() {
  
  const router = useRouter()
  const [certificateId, setCertificateId] = useState('')
  const [certDetails, setCertDetails] = useState<Certificate | null>(null)

  // In a real application, you would check the waitlist status from a backend or local storage
  // const isWaitlisted = true // This is a placeholder. Replace with actual logic.

  // if (!isWaitlisted) {
  //   router.push('/')
  //   return null
  // }
  // Placeholder waitlist logic
  const isWaitlisted = true

  useEffect(() => {
    certificateService.connectWallet()
      .then(address => console.log('Connected wallet:', address))
      .catch((error) => toast.error(error.message))
  }, [])

  if (!isWaitlisted) {
    router.push('/')
    return null
  }

  // const handleVerifyCertificate = (e: React.FormEvent) => {
  //   e.preventDefault()
  //   // Here you would typically send the data to your backend
  //   toast.success('Certificate verified successfully!')
  // }
  const handleVerifyCertificate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const valid = await certificateService.verifyCertificate(certificateId)
    if (valid === null) {
      toast.error('Error verifying certificate')
    } else {
      toast.success(`Certificate is ${valid ? 'valid' : 'invalid'}`)
      // Optionally, fetch full certificate details if available
      const cert = await certificateService.getCertificate(certificateId)
      setCertDetails(cert)
    }
  }

  // const handleTransferCertificate = (e: React.FormEvent) => {
  //   e.preventDefault()
  //   // Here you would typically send the data to your backend
  //   toast.success('Certificate transfer initiated!')
  // }
  const handleTransferCertificate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // If you add a transferCertificate method to your certificateService, invoke it here
    toast.success('Certificate transfer initiated!')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-white to-blue-600">
      <Navbar isWaitlisted={isWaitlisted} />
      <Toaster position="top-right" />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Recipient Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* My Certificates Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">My Certificates</h2>
            {certDetails ? (
              <div className="p-2 bg-gray-100 rounded">
                <p>ID: {certDetails.id}</p>
                <p>Recipient: {certDetails.recipientName}</p>
                <p>Issued on: {new Date(certDetails.issueDate * 1000).toLocaleString()}</p>
                <p>Status: {certDetails.isValid ? 'Valid' : 'Invalid'}</p>
              </div>
            ) : (
              <p>No certificate details available.</p>
            )}
          </div>
          {/* Verify Certificate Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Verify Certificate</h2>
            <form onSubmit={handleVerifyCertificate} className="space-y-4">
              <div>
                <label htmlFor="certificateId" className="block mb-1">Certificate ID</label>
                <input
                  type="text"
                  name="certificateId"
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
          {/* Transfer Certificate Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Transfer Certificate</h2>
            <form onSubmit={handleTransferCertificate} className="space-y-4">
              <div>
                <label htmlFor="transferCertificateId" className="block mb-1">Certificate ID</label>
                <input type="text" name="transferCertificateId" id="transferCertificateId" required className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label htmlFor="recipientAddress" className="block mb-1">Recipient Wallet Address</label>
                <input type="text" name="recipientAddress" id="recipientAddress" required className="w-full px-3 py-2 border rounded" />
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors">
                Transfer Certificate
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-red-600 via-white to-blue-600">
//       <Navbar isWaitlisted={isWaitlisted} />
//       <Toaster position="top-right" />
//       <main className="container mx-auto px-4 py-8">
//         <h1 className="text-4xl font-bold mb-8 text-center">Recipient Dashboard</h1>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           <div className="bg-white rounded-lg shadow-lg p-6">
//             <h2 className="text-2xl font-bold mb-4">My Certificates</h2>
//             <ul className="space-y-2">
//               <li className="p-2 bg-gray-100 rounded">Certificate 1</li>
//               <li className="p-2 bg-gray-100 rounded">Certificate 2</li>
//               <li className="p-2 bg-gray-100 rounded">Certificate 3</li>
//             </ul>
//           </div>
//           <div className="bg-white rounded-lg shadow-lg p-6">
//             <h2 className="text-2xl font-bold mb-4">Verify Certificate</h2>
//             <form onSubmit={handleVerifyCertificate} className="space-y-4">
//               <div>
//                 <label htmlFor="certificateId" className="block mb-1">Certificate ID</label>
//                 <input
//                   type="text"
//                   id="certificateId"
//                   value={certificateId}
//                   onChange={(e) => setCertificateId(e.target.value)}
//                   required
//                   className="w-full px-3 py-2 border rounded"
//                 />
//               </div>
//               <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
//                 Verify Certificate
//               </button>
//             </form>
//           </div>
//           <div className="bg-white rounded-lg shadow-lg p-6">
//             <h2 className="text-2xl font-bold mb-4">Transfer Certificate</h2>
//             <form onSubmit={handleTransferCertificate} className="space-y-4">
//               <div>
//                 <label htmlFor="transferCertificateId" className="block mb-1">Certificate ID</label>
//                 <input type="text" id="transferCertificateId" required className="w-full px-3 py-2 border rounded" />
//               </div>
//               <div>
//                 <label htmlFor="recipientAddress" className="block mb-1">Recipient Wallet Address</label>
//                 <input type="text" id="recipientAddress" required className="w-full px-3 py-2 border rounded" />
//               </div>
//               <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors">
//                 Transfer Certificate
//               </button>
//             </form>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// };

