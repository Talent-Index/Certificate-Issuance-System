// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import Navbar from '../../components/Navbar'
// import { Toaster, toast } from 'react-hot-toast'
// import { Avalanche, BinTools, Buffer } from 'avalanche'

// export default function RecipientDashboard() {
//   const router = useRouter()
//   const [certificateId, setCertificateId] = useState('')
//   const [transferCertificateId, setTransferCertificateId] = useState('')
//   const [recipientAddress, setRecipientAddress] = useState('')

//   // Initialize Avalanche connection for Fuji Testnet
//   const avalanche = new Avalanche('api.avax-test.network', 443, 'https');
//   const avm = avalanche.XChain();
//   const keyChain = avm.keyChain();

  // // In a real application, you would check the waitlist status from a backend or local storage
  // const isWaitlisted = true // This is a placeholder. Replace with actual logic.

  // if (!isWaitlisted) {
  //   router.push('/')
  //   return null
  // }

//   const handleVerifyCertificate = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       // Simulate certificate verification on the blockchain (adjust with your actual contract logic)
//       const certificateStatus = await avm.getTxStatus(certificateId)
//       toast.success(`Certificate verified successfully! Status: ${certificateStatus}`)
//     } catch (error) {
//       toast.error('Error verifying certificate.')
//     }
//   }

  // const handleTransferCertificate = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   try {
  //     // Simulate certificate transfer using blockchain interaction (adjust with your actual logic)
  //     const tx = await avm.buildBaseTx(
  //       1000000, // Amount
  //       'X-avax1x8e3hdhl99skdlmd45g', // Sender's address
  //       [recipientAddress], // Receiver's address
  //       keyChain.getAddressStrings(), // Address strings for signing
  //       Buffer.from(transferCertificateId, 'utf-8') // Transaction metadata (certificate ID)
  //     )

  //     const txID = await avm.issueTx(tx)
  //     toast.success(`Certificate transfer initiated! Transaction ID: ${txID}`)
  //   } catch (error) {
  //     toast.error('Error transferring certificate.')
  //   }
// }


// src/pages/recipient/dashboard.tsx
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { Toaster, toast } from 'react-hot-toast';
import { certificateService } from '../../utils/contractinteraction';

export default function RecipientDashboard() {
  const router = useRouter();
  const [certificateId, setCertificateId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // In a real application, you would check the waitlist status from a backend or local storage
  const isWaitlisted = true; // This is a placeholder. Replace with actual logic.

  if (!isWaitlisted) {
    router.push('/');
    return null;
  }

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const address = await certificateService.getConnectedAddress();
        if (!address) {
          router.push('/');
        }
        // Here you could load the user's certificates
        // This would require additional contract functionality
      } catch (error: any) {
        router.push('/');
      }
    };
    initializeDashboard();
  }, []);

  const handleVerifyCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const certificate = await certificateService.getCertificate(certificateId);
      const isValid = await certificateService.verifyCertificate(certificateId);
      toast.success(
        `Certificate Details:\nRecipient: ${certificate.recipientName}\nValid: ${isValid}`
      );
    } catch (error) {
      toast.error('Failed to verify certificate');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-white to-blue-600">
      <Navbar isWaitlisted={isWaitlisted} />
      <Toaster position="top-right" />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Recipient Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">My Certificates</h2>
            <ul className="space-y-2">
              <li className="p-2 bg-gray-100 rounded">Certificate 1</li>
              <li className="p-2 bg-gray-100 rounded">Certificate 2</li>
              <li className="p-2 bg-gray-100 rounded">Certificate 3</li>
            </ul>
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
                {isLoading ? "Verifying..." : "Verify Certificate"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}