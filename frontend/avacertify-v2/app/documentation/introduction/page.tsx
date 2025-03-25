import { Card, CardContent } from "@/components/ui/card"

export default function Introduction() {
  return (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold mb-6">Introduction</h1>
      <Card>
        <CardContent className="p-6">
          <p className="mb-4">
            AvaCertify is a cutting-edge decentralized application (dApp) built on the Avalanche blockchain, designed to
            revolutionize certificate issuance, verification, and revocation. By leveraging blockchain technology and
            smart contracts, AvaCertify provides an immutable, fraud-proof, and universally accessible system for
            educational institutions, employers, and certification bodies.
          </p>
          <p className="mb-4">This document provides a comprehensive technical overview of AvaCertify, including:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>The problem it solves and why it is critical</li>
            <li>The technical architecture and implementation</li>
            <li>Smart contract development and deployment on Avalanche</li>
            <li>Security, scalability, and efficiency considerations</li>
            <li>Integration with existing systems and user adoption</li>
            <li>Competitive advantage and innovation in Web3</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

