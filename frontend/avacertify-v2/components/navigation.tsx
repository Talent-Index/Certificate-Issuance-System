"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, LayoutDashboard, CheckCircle, Info, User, Bell } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { WalletConnect } from "./wallet-connect"
import { motion } from "framer-motion"
import { useToast } from "../hooks/use-toast"

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Verify", href: "/verify", icon: CheckCircle },
  { name: "About", href: "/about", icon: Info },
  { name: "Profile", href: "/profile", icon: User },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { toast } = useToast()

  const handleConnect = () => {
    toast({
      title: "Connecting Wallet",
      description: "Please approve the connection request in your wallet.",
    })
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <motion.img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Avacerify%20logo-3L4whQx9hWLHOgiWk6KoYufLDWSfgE.webp"
              alt="AvaCertify Logo"
              className="h-8 w-8"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
            <span className="font-bold text-xl gradient-text">AvaCertify</span>
          </Link>
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <motion.div key={item.href} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
                    ${
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-primary/5 text-foreground/60 hover:text-primary"
                    }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
  {/* Notification Button - Hidden on small screens */}
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="hidden md:block" // Hide on small screens, show on medium and larger screens
>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() =>
                toast({
                  title: "Notifications",
                  description: "You have no new notifications",
                })
              }
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full" />
            </Button>
          </motion.div>
          <ThemeToggle />
          <WalletConnect />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary ${
                      pathname === item.href ? "text-primary" : "text-foreground/60"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                <Button variant="default" onClick={handleConnect}>
                  Connect Wallet
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  )
}


