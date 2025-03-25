"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "../hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Wallet, ChevronDown } from "lucide-react"

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>
    }
    avalanche?: {
      request: (args: { method: string }) => Promise<string[]>
    }
  }
}

export function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null)
  const [, setWalletType] = useState<"metamask" | "core" | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async (): Promise<void> => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
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

  const connectMetaMask = async (): Promise<void> => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
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

