// 

'use client'

// import { ethers } from 'ethers'
// import { motion } from 'framer-motion'
import { Home, FileText, User, Settings, Wallet, Router } from 'lucide-react'
import { useState, useEffect,  } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { auth, db } from '../app/firebase' // Make sure you have this configured
import { doc, getDoc } from 'firebase/firestore'


interface NavbarProps {
  isWaitlisted: boolean
}

export default function Navbar({ isWaitlisted }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)



  const connectWallet = async () => {
    try {
      setIsConnecting(true)
      const { ethereum } = window as any
      if (!ethereum) {
        alert('Please install MetaMask!')
        return
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      })

      setWalletAddress(accounts[0])

      // Switch to Avalanche C-Chain
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xa86a' }], // Chain ID for Avalanche C-Chain
        })
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xa86a',
              chainName: 'Avalanche C-Chain',
              nativeCurrency: {
                name: 'AVAX',
                symbol: 'AVAX',
                decimals: 18
              },
              rpcUrls: ['https://avalanche-fuji.infura.io/v3/9b678c2b1eeb4470bab5c65c8c11cc67'],
              blockExplorerUrls: ['https://snowtrace.io/']
            }]
          })
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const navItems = [
    { name: 'Home', href: '/', icon: Home, requiresAuth: false },
    { name: 'Issuer Dashboard', href: '/issuer-dashboard', icon: FileText },
    { name: 'Recipient Dashboard', href: '/recipient-dashboard', icon: User },
    { name: 'Profile', href: '/profile', icon: Settings },
  ]
  
  
  return (
    <nav className="bg-white shadow-md">
      {/*Logo*/} 
      <div className="flex items-center">
        <div className="flex-shrink-0 flex items-center px-4 py-4">
          <Link href="/">
            <span className="text-2xl font-bold text-blue-600">AvaCertify</span>
          </Link>
        </div>
          {/*nav-container*/}
        <div className="container mx-auto flex justify-end items-center h-16 px-6 sm:px-8 lg:px-16 xl:px-20">
          <div className="flex justify-between h-16">
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={(!item.requiresAuth || isAuthenticated) ? item.href : '#'}
                  onClick={(e) => {
                    if (item.requiresAuth && !isAuthenticated) {
                      e.preventDefault()
                      router.push('/')
                    }
                  }}
                  className={`${pathname === item.href
                      ? 'border-blue-600 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <item.icon className="h-5 w-5 mr-1" />
                  {item.name}
                </Link>
              ))}

              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                <Wallet className="h-5 w-5 mr-2" />
                {isConnecting
                  ? "Connecting..."
                  : walletAddress
                    ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`
                    : "Connect Wallet"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
