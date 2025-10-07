"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { Layout } from "@/components/layout"
import type React from "react"
// SpeedInsights intentionally not used directly in layout; import removed to satisfy linter

interface NavItem {
  title: string
  href: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/documentation/introduction" },
      { title: "Problem Statement", href: "/documentation/problem-statement" },
    ],
  },
  {
    title: "Technical Details",
    items: [
      { title: "Architecture", href: "/documentation/architecture" },
      { title: "Smart Contracts", href: "/documentation/smart-contracts" },
  { title: "Frontend & UI", href: "/documentation/frontend" },
      { title: "Backend & API", href: "/documentation/backend" },
    ],
  },
  {
    title: "Deployment",
    items: [
      { title: "Why Avalanche?", href: "/documentation/why-avalanche" },
      { title: "Deployment Steps", href: "/documentation/deployment-steps" },
    ],
  },
  {
    title: "Business",
    items: [
      { title: "Market Adoption", href: "/documentation/market-adoption" },
      { title: "Customer Benefits", href: "/documentation/customer-benefits" },
      { title: "Competitive Advantage", href: "/documentation/competitive-advantage" },
    ],
  },
]

function NavSection({ section, isOpen, onToggle }: { section: NavSection; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg"
      >
        {section.title}
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen ? "transform rotate-180" : "")} />
      </button>
      {isOpen && (
        <div className="mt-1 ml-4 space-y-1">
          {section.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary rounded-lg"
            >
              {item.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DocLayout({ children }: { children: React.ReactNode }) {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(
    sections.reduce((acc, section) => ({ ...acc, [section.title]: true }), {}),
  )

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <Layout>
      <div className="flex min-h-screen">
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block"
        >
          <div className="sticky top-0 p-4 space-y-4 h-screen overflow-y-auto">
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-2">Documentation</h2>
              <p className="text-sm text-muted-foreground">Learn about AvaCertify</p>
            </div>
            {sections.map((section) => (
              <NavSection
                key={section.title}
                section={section}
                isOpen={openSections[section.title]}
                onToggle={() => toggleSection(section.title)}
              />
            ))}
          </div>
        </motion.aside>
        <main className="flex-1 overflow-y-auto">
          <div className="container py-10">{children}</div>
        </main>
      </div>
    </Layout>
  )
}