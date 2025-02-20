"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export default function Documentation() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div {...fadeInUp}>
        <section id="introduction" className="mb-16">
          <h1 className="text-4xl font-bold mb-6">AvaCertify Documentation</h1>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Introduction</h2>
              <p className="text-muted-foreground">
                AvaCertify is a cutting-edge decentralized application (dApp) built on the Avalanche blockchain,
                designed to revolutionize certificate issuance, verification, and revocation.
              </p>
            </CardContent>
          </Card>
        </section>

        <motion.section
          id="problem-statement"
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold mb-6">Problem Statement</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Current Challenges</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Time-Consuming Manual Verification</li>
                  <li>Fraud and Counterfeits</li>
                  <li>Centralized Vulnerabilities</li>
                  <li>Limited Global Accessibility</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        <motion.section
          id="technical-architecture"
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold mb-6">Technical Architecture</h2>
          <Tabs defaultValue="smart-contracts">
            <TabsList>
              <TabsTrigger value="smart-contracts">Smart Contracts</TabsTrigger>
              <TabsTrigger value="frontend">Frontend</TabsTrigger>
              <TabsTrigger value="backend">Backend</TabsTrigger>
            </TabsList>
            <TabsContent value="smart-contracts">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Smart Contract Layer</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AvaCertify is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    mapping(uint256 => bool) public revokedCertificates;

    constructor() ERC721("AvaCertify", "AVCRT") {}

    function issueCertificate(address recipient, string memory metadataURI) 
        public onlyOwner {
        uint256 newCertificateId = _tokenIdCounter++;
        _safeMint(recipient, newCertificateId);
        _setTokenURI(newCertificateId, metadataURI);
    }

    function verifyCertificate(uint256 certificateId) 
        public view returns (bool) {
        return !revokedCertificates[certificateId];
    }

    function revokeCertificate(uint256 certificateId) public onlyOwner {
        revokedCertificates[certificateId] = true;
    }
}`}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="frontend">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Frontend & User Interface</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Built using React.js and Next.js</li>
                    <li>Integrates Web3.js and ethers.js for blockchain interactions</li>
                    <li>Institution dashboard for certificate management</li>
                    <li>Simple verification interface for students and employers</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="backend">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Backend & API Layer</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Node.js & Express backend</li>
                    <li>IPFS integration for metadata storage</li>
                    <li>REST API for third-party integrations</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.section>

        {/* Additional sections continue with similar structure */}
      </motion.div>
    </div>
  )
}

