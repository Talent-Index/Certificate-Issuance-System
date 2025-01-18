// src/pages/profile/index.tsx
'use client'



import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import { certificateService } from '../../utils/contractinteraction'
import { Toaster, toast } from 'react-hot-toast'

export default function Profile() {
  const router = useRouter()
  const [name, setName] = useState('John Doe')
  const [email, setEmail] = useState('john@example.com')
  const [role, setRole] = useState('Recipient')
  const [isEditing, setIsEditing] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // In a real application, you would check the waitlist status from a backend or local storage
  const isWaitlisted = true // This is a placeholder. Replace with actual logic.

  if (!isWaitlisted) {
    router.push('/')
    return null
  }

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        const address = await certificateService.getConnectedAddress();
        setWalletAddress(address);
      } catch (error) {
        console.error('Wallet not connected');
      } finally {
        setIsLoading(false);
      }
    };
    initializeProfile();
  }, []);

  const handleConnectWallet = async () => {
    setIsLoading(true);
    try {
      const address = await certificateService.connectWallet();
      setWalletAddress(address);
      toast.success('Wallet connected successfully!');
    } catch (error) {
      toast.error('Failed to connect wallet');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log({ name, email, role })
    setIsEditing(false)
    toast.success('Profile updated successfully!')
  }
  
  // Add this section to your profile display
  const WalletSection = () => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Wallet Details</h3>
      {walletAddress ? (
        <p className="break-all">
          <strong>Connected Address:</strong> {walletAddress}
        </p>
      ) : (
        <button
          onClick={handleConnectWallet}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-white to-blue-600">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <WalletSection />
        <Navbar isWaitlisted={isWaitlisted} />
        <Toaster position="top-right" />
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-center">User Profile</h1>
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block mb-1">Role</label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="Issuer">Issuer</option>
                    <option value="Recipient">Recipient</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Role:</strong> {role}</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
          </main>
      </div>
    </div>
  )
}
