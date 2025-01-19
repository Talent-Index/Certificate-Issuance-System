// src/pages/profile/index.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { Toaster, toast } from 'react-hot-toast'

interface UserProfile {
  name: string
  email: string
  organization?: string
  role?: string
  walletAddress?: string
  isApproved?: boolean
  applicationDate?: string
  // Add other fields as needed
}

export default function Profile() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect((): void => {
    const loadProfile = async () => {
      try {
        const user = auth.currentUser
        if (!user) {
          router.push('/')
          return
        }

        const userDoc = await getDoc(doc(db, 'waitlist', user.uid))
        if (userDoc.exists()) {
          setProfile({
            name: userDoc.data().name || '',
            email: userDoc.data().email || '',
            organization: userDoc.data().organization || '',
            role: userDoc.data().role || '',
            walletAddress: userDoc.data().walletAddress || '',
            isApproved: userDoc.data().isApproved || false,
            applicationDate: userDoc.data().createdAt?.toDate().toLocaleDateString() || '',
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        toast.error('Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Profile Information</h1>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 p-2 bg-gray-50 rounded-md">{profile?.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 p-2 bg-gray-50 rounded-md">{profile?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Organization</label>
                <p className="mt-1 p-2 bg-gray-50 rounded-md">{profile?.organization || 'Not specified'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1 p-2 bg-gray-50 rounded-md">{profile?.role || 'Not specified'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Wallet Address</label>
                <p className="mt-1 p-2 bg-gray-50 rounded-md">{profile?.walletAddress || 'Not connected'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Application Status</label>
                <p className="mt-1 p-2 bg-gray-50 rounded-md">
                  {profile?.isApproved ? (
                    <span className="text-green-600 font-medium">Approved</span>
                  ) : (
                    <span className="text-yellow-600 font-medium">Pending</span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Application Date</label>
                <p className="mt-1 p-2 bg-gray-50 rounded-md">{profile?.applicationDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


// 'use client'



// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import Navbar from '../../components/Navbar'
// import { certificateService } from '../../utils/contractinteraction'
// import { Toaster, toast } from 'react-hot-toast'

// export default function Profile() {
//   const router = useRouter()
//   const [name, setName] = useState('John Doe')
//   const [email, setEmail] = useState('john@example.com')
//   const [role, setRole] = useState('Recipient')
//   const [isEditing, setIsEditing] = useState(false)
//   const [walletAddress, setWalletAddress] = useState('')
//   const [isLoading, setIsLoading] = useState(true)

//   // In a real application, you would check the waitlist status from a backend or local storage
//   const isWaitlisted = true // This is a placeholder. Replace with actual logic.

//   if (!isWaitlisted) {
//     router.push('/')
//     return null
//   }

//   useEffect(() => {
//     const initializeProfile = async () => {
//       try {
//         const address = await certificateService.getConnectedAddress();
//         setWalletAddress(address);
//       } catch (error) {
//         console.error('Wallet not connected');
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     initializeProfile();
//   }, []);

//   const handleConnectWallet = async () => {
//     setIsLoading(true);
//     try {
//       const address = await certificateService.connectWallet();
//       setWalletAddress(address);
//       toast.success('Wallet connected successfully!');
//     } catch (error) {
//       toast.error('Failed to connect wallet');
//       console.error(error);
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     // Here you would typically send the data to your backend
//     console.log({ name, email, role })
//     setIsEditing(false)
//     toast.success('Profile updated successfully!')
//   }
  
//   // Add this section to your profile display
//   const WalletSection = () => (
//     <div className="mt-4 p-4 bg-gray-50 rounded-lg">
//       <h3 className="text-lg font-semibold mb-2">Wallet Details</h3>
//       {walletAddress ? (
//         <p className="break-all">
//           <strong>Connected Address:</strong> {walletAddress}
//         </p>
//       ) : (
//         <button
//           onClick={handleConnectWallet}
//           disabled={isLoading}
//           className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
//         >
//           {isLoading ? "Connecting..." : "Connect Wallet"}
//         </button>
//       )}
//     </div>
//   )

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-red-600 via-white to-blue-600">
//       <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
//         <WalletSection />
//         <Navbar isWaitlisted={isWaitlisted} />
//         <Toaster position="top-right" />
//         <main className="container mx-auto px-4 py-8">
//           <h1 className="text-4xl font-bold mb-8 text-center">User Profile</h1>
//           <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
//             {isEditing ? (
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <label htmlFor="name" className="block mb-1">Name</label>
//                   <input
//                     type="text"
//                     id="name"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     required
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="email" className="block mb-1">Email</label>
//                   <input
//                     type="email"
//                     id="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="role" className="block mb-1">Role</label>
//                   <select
//                     id="role"
//                     value={role}
//                     onChange={(e) => setRole(e.target.value)}
//                     required
//                     className="w-full px-3 py-2 border rounded"
//                   >
//                     <option value="Issuer">Issuer</option>
//                     <option value="Recipient">Recipient</option>
//                   </select>
//                 </div>
//                 <button
//                   type="submit"
//                   className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
//                 >
//                   Save Changes
//                 </button>
//               </form>
//             ) : (
//               <div className="space-y-4">
//                 <p><strong>Name:</strong> {name}</p>
//                 <p><strong>Email:</strong> {email}</p>
//                 <p><strong>Role:</strong> {role}</p>
//                 <button
//                   onClick={() => setIsEditing(true)}
//                   className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
//                 >
//                   Edit Profile
//                 </button>
//               </div>
//             )}
//           </div>
//           </main>
//       </div>
//     </div>
//   )
// }

