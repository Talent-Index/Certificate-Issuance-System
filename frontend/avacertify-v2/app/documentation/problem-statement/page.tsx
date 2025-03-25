import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProblemStatement() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold mb-6">
        Problem Statement: The Need for Decentralized Certificate Verification
      </h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>The Problem</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Current certificate verification systems suffer from several major inefficiencies:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Time-Consuming Manual Verification: Employers and institutions must contact issuers to verify credentials,
              leading to delays and inefficiencies.
            </li>
            <li>
              Fraud and Counterfeits: The rise of fake certificates undermines the value of genuine credentials, costing
              businesses and institutions billions of dollars annually.
            </li>
            <li>
              Centralized Vulnerabilities: Traditional systems are controlled by single entities, making them prone to
              manipulation, hacks, and data breaches.
            </li>
            <li>
              Limited Global Accessibility: Many systems are regionally siloed, making it hard for international
              employers to verify credentials efficiently.
            </li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Why Blockchain is the Solution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Blockchain technology fundamentally changes how certificates are issued and verified by:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Providing Instant Verification: On-chain data is instantly verifiable without reliance on intermediaries.
            </li>
            <li>Ensuring Immutability: Data on the blockchain cannot be altered or tampered with.</li>
            <li>Enhancing Transparency: Public verification eliminates trust issues.</li>
            <li>Facilitating Decentralization: Removes the need for centralized authorities.</li>
            <li>
              Avalanche&apos;s high-speed, low-cost infrastructure enables efficient certificate management.
            </li>
          </ul>
          <p className="mt-4">
            AvaCertify leverages Avalanche's high-speed, low-cost, and secure blockchain infrastructure to deliver these
            advantages at scale.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

