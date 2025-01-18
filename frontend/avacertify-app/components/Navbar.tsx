// 'use client'

// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
// //import { motion } from 'framer-motion'
// import { Home, FileText, User, Settings } from 'lucide-react'

// interface NavbarProps {
//   isWaitlisted: boolean
// }

// export default function Navbar({ isWaitlisted }: NavbarProps) {
//   const pathname = usePathname()

//   const navItems = [
//     { name: 'Home', href: '/', icon: Home },
//     { name: 'Issuer Dashboard', href: '/issuer-dashboard', icon: FileText },
//     { name: 'Recipient Dashboard', href: '/recipient-dashboard', icon: User },
//     { name: 'Profile', href: '/profile', icon: Settings },
//   ]

//   return (
//     <nav className="bg-white shadow-md">
//            {/*Logo*/} 
//            <div className="flex items-center">
//             <div className="flex-shrink-0 flex items-center padding-4 margin-4">
//               <Link href="/">
//                 <span className="text-2xl font-bold text-blue-600">AvaCertify</span>
//               </Link>
//             </div>     
//             {/*nav-container*/}
//       <div className="container mx-auto flex justify-end items-center h-16 px-6 sm:px-8 lg:px-16 xl:px-20">
//         <div className="flex justify-between h-16">
//             <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
//               {navItems.map((item) => (
//                 <Link
//                   key={item.name}
//                   href={isWaitlisted || item.href === '/' ? item.href : '#'}
//                   className={`${
//                     pathname === item.href
//                       ? 'border-blue-500 text-gray-900'
//                       : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
//                   } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
//                 >
//                   <item.icon className="h-5 w-5 mr-1" />
//                   {item.name}
//                 </Link>
//               ))}
//               {/* Connect Wallet button */}
//               {/* <button
//                 onClick={connectWallet}
//                 disabled={isConnecting}
//                 className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
//               >
//                 {isConnecting
//                   ? "Connecting..."
//                   : walletAddress
//                     ? `Connected: ${walletAddress.substring(0, 6)}...`
//                     : "Connect Wallet"}
//               </button> */}
//               {navItems.slice(3).map((item) => (
//                 <Link
//                   key={item.name}
//                   href={isWaitlisted || item.href === '/' ? item.href : '#'}
//                   className={`${
//                     pathname === item.href
//                       ? 'border-blue-500 text-gray-900'
//                       : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
//                   } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
//                 >
//                   <item.icon className="h-5 w-5 mr-1" />
//                   {item.name}
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </nav>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, User, Settings, Wallet } from 'lucide-react'
import { ethers } from 'ethers'

interface NavbarProps {
  isWaitlisted: boolean
}

export default function Navbar({ isWaitlisted }: NavbarProps) {
  const pathname = usePathname()
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [isConnecting, setIsConnecting] = useState(false)

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Issuer Dashboard', href: '/issuer-dashboard', icon: FileText },
    { name: 'Recipient Dashboard', href: '/recipient-dashboard', icon: User },
    { name: 'Profile', href: '/profile', icon: Settings },
  ]

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window as any
      if (!ethereum) {
        console.log('Make sure you have MetaMask installed!')
        return
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' })
      if (accounts.length !== 0) {
        setWalletAddress(accounts[0])
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error)
    }
  }

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
              rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
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

  return (
    <nav className="bg-white shadow-md">
      <div className="flex items-center">
        <div className="flex-shrink-0 flex items-center px-4 py-4">
          <Link href="/">
            <span className="text-2xl font-bold text-blue-600">AvaCertify</span>
          </Link>
        </div>

        <div className="container mx-auto flex justify-end items-center h-16 px-6 sm:px-8 lg:px-16 xl:px-20">
          <div className="flex justify-between h-16">
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={isWaitlisted || item.href === '/' ? item.href : '#'}
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