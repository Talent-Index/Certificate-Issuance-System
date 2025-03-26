"use client"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from 'next/dynamic'

// Dynamically import icons
const Shield = dynamic(() => import('lucide-react').then(mod => mod.Shield))
const Zap = dynamic(() => import('lucide-react').then(mod => mod.Zap))
const Globe = dynamic(() => import('lucide-react').then(mod => mod.Globe))

export default function About() {
  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6 animate-fade-in">About AvaCertify</h1>
        <div className="max-w-3xl mx-auto">
          <p className="text-lg mb-8 animate-fade-in animate-delay-200">
            AvaCertify is a cutting-edge decentralized application (dApp) built on the Avalanche blockchain, designed to
            revolutionize certificate issuance, verification, and revocation. By leveraging blockchain technology and
            smart contracts, we provide an immutable, fraud-proof, and universally accessible system for educational
            institutions, employers, and certification bodies.
          </p>
          <h2 className="text-2xl font-bold mb-4 animate-fade-in animate-delay-300">Our Mission</h2>
          <p className="text-lg mb-8 animate-fade-in animate-delay-400">
            Our mission is to create a global, decentralized ecosystem of trust for academic and professional
            credentials. We aim to empower individuals with control over their achievements while providing institutions
            and employers with a reliable, efficient verification system.
          </p>
          <h2 className="text-2xl font-bold mb-4 animate-fade-in animate-delay-500">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="animate-fade-in animate-delay-600">
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Tamper-Proof Security</CardTitle>
              </CardHeader>
              <CardContent>
                Certificates are stored on the blockchain, making them impossible to forge or alter.
              </CardContent>
            </Card>
            <Card className="animate-fade-in animate-delay-700">
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Instant Verification</CardTitle>
              </CardHeader>
              <CardContent>Verify credentials in seconds, eliminating lengthy manual processes.</CardContent>
            </Card>
            <Card className="animate-fade-in animate-delay-800">
              <CardHeader>
                <Globe className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Global Accessibility</CardTitle>
              </CardHeader>
              <CardContent>Access and verify certificates from anywhere in the world, 24/7.</CardContent>
            </Card>
          </div>
          <h2 className="text-2xl font-bold mb-4 animate-fade-in animate-delay-900">Our Technology</h2>
          <p className="text-lg mb-4 animate-fade-in animate-delay-1000">
            AvaCertify is built on the Avalanche blockchain, known for its high speed, low costs, and eco-friendliness.
            We use smart contracts to manage the entire lifecycle of certificates, ensuring transparency and security at
            every step.
          </p>
          <p className="text-lg animate-fade-in animate-delay-1100">
            Join us in revolutionizing the way we issue, manage, and verify credentials in the digital age.
          </p>
        </div>
      </div>
    </Layout>
  )
}

