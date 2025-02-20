"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { Twitter, Github, Linkedin, Mail } from "lucide-react"
import { DiscIcon as Discord } from "lucide-react"

const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "https://twitter.com/avacertify" },
  { name: "GitHub", icon: Github, href: "https://github.com/avacertify" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/avacertify" },
  { name: "Discord", icon: Discord, href: "https://discord.gg/avacertify" },
  { name: "Email", icon: Mail, href: "mailto:contact@avacertify.com" },
]

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-sm text-foreground/60 hover:text-primary">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-foreground/60 hover:text-primary">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-sm text-foreground/60 hover:text-primary">
                  Security
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-foreground/60 hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-foreground/60 hover:text-primary">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-foreground/60 hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-sm text-foreground/60 hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="text-sm text-foreground/60 hover:text-primary">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-foreground/60 hover:text-primary">
                  Support
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-foreground/5 hover:bg-primary/10 hover:text-primary transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.name}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-sm text-foreground/60">© {new Date().getFullYear()} AvaCertify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

