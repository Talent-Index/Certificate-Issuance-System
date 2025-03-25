import type { ReactNode } from "react"
import { Navigation } from "./navigation"
import { Footer } from "./footer"

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  )
}

