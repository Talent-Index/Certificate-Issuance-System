"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "../hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Wallet, ChevronDown } from "lucide-react"

declare global {
  interface Window {
    avalanche?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<string[]>
    }
  }
}

/**
 * A React component that handles wallet connections for both MetaMask and Core wallets.
 * Provides UI for connecting, disconnecting, and displaying connected wallet information.
 * @returns A React component with wallet connection functionality
 */
export function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null)
  const [, setWalletType] = useState<"metamask" | "core" | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    checkConnection()
  }, [])

  /**
   * Checks for any existing wallet connections on component mount.
   * Attempts to connect to either MetaMask or Core wallet if they were previously connected.
   * @returns Promise that resolves when connection check is complete
   */
  const checkConnection = async (): Promise<void> => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" }) as string[]
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setWalletType("metamask")
        }
      } catch (error) {
        console.error("Failed to get accounts", error)
      }
    } else if (typeof window.avalanche !== "undefined") {
      try {
        const accounts = await window.avalanche.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setWalletType("core")
        }
      } catch (error) {
        console.error("Failed to get accounts", error)
      }
    }
  }

  /**
   * Initiates a connection to MetaMask wallet.
   * Shows success or error toast notifications based on connection result.
   * @returns Promise that resolves when MetaMask connection attempt is complete
   */
  const connectMetaMask = async (): Promise<void> => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        const accounts = await window.ethereum.request({ method: "eth_accounts" }) as string[]
        setAccount(accounts[0])
        setWalletType("metamask")
        toast({
          title: "Wallet Connected",
          description: "MetaMask wallet connected successfully.",
        })
      } catch (error) {
        console.error("Failed to connect to MetaMask", error)
        toast({
          title: "Connection Failed",
          description: "Failed to connect to MetaMask. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask extension and try again.",
        variant: "destructive",
      })
    }
  }

  /**
   * Initiates a connection to Core wallet.
   * Shows success or error toast notifications based on connection result.
   * @returns Promise that resolves when Core wallet connection attempt is complete
   */
  const connectCoreWallet = async (): Promise<void> => {
    if (typeof window.avalanche !== "undefined") {
      try {
        await window.avalanche.request({ method: "eth_requestAccounts" })
        const accounts = await window.avalanche.request({ method: "eth_accounts" })
        setAccount(accounts[0])
        setWalletType("core")
        toast({
          title: "Wallet Connected",
          description: "Core wallet connected successfully.",
        })
      } catch (error) {
        console.error("Failed to connect to Core Wallet", error)
        toast({
          title: "Connection Failed",
          description: "Failed to connect to Core Wallet. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Core Wallet Not Found",
        description: "Please install Core Wallet extension and try again.",
        variant: "destructive",
      })
    }
  }

  /**
   * Disconnects the currently connected wallet.
   * Resets account and wallet type states to null.
   * Shows a notification toast when wallet is disconnected.
   */
  const disconnectWallet = () => {
    setAccount(null)
    setWalletType(null)
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    })
  }

  if (account) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center">
            <Wallet className="mr-2 h-4 w-4" />
            {`${account.slice(0, 6)}...${account.slice(-4)}`}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={disconnectWallet}>Disconnect Wallet</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={connectMetaMask}>Connect MetaMask</DropdownMenuItem>
        <DropdownMenuItem onClick={connectCoreWallet}>Connect Core Wallet</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}