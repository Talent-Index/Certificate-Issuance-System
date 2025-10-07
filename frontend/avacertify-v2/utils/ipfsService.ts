// src/utils/ipfsService.ts
import { Buffer } from "buffer";

export class IPFSService {
  private pinataApiKey: string;
  private pinataApiSecret: string;
  private gatewayUrl: string = "https://gateway.pinata.cloud/ipfs/";

  constructor() {
    this.pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || "";
    this.pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET || "";
    if (!this.pinataApiKey || !this.pinataApiSecret) {
      throw new Error("Pinata API credentials not configured");
    }
  }

  async uploadFile(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          pinata_api_key: this.pinataApiKey,
          pinata_secret_api_key: this.pinataApiSecret,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Pinata upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.IpfsHash;
    } catch (error: any) {
      console.error("IPFS file upload error:", error);
      throw new Error(error.message || "Failed to upload file to IPFS");
    }
  }

  async uploadJSON(json: object): Promise<string> {
    try {
      const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: this.pinataApiKey,
          pinata_secret_api_key: this.pinataApiSecret,
        },
        body: JSON.stringify(json),
      });

      if (!response.ok) {
        throw new Error(`Pinata JSON upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.IpfsHash;
    } catch (error: any) {
      console.error("IPFS JSON upload error:", error);
      throw new Error(error.message || "Failed to upload JSON to IPFS");
    }
  }

  generateMetadata(
    name: string,
    description: string,
    documentHash: string,
    backgroundColor: string,
    organization: string
  ): object {
    return {
      name,
      description,
      image: documentHash ? `${this.gatewayUrl}${documentHash}` : undefined,
      attributes: [
        { trait_type: "Organization", value: organization },
        { trait_type: "Background Color", value: backgroundColor },
      ],
    };
  }

  getGatewayUrl(hash: string): string {
    return `${this.gatewayUrl}${hash}`;
  }
}