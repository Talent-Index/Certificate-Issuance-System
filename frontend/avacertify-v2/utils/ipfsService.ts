// Browser-compatible IPFS service using Pinata

/**
 * Service for interacting with IPFS through Pinata API
 * Handles file and metadata uploads to IPFS in a browser environment
 */
export class IPFSService {
    private pinataApiKey: string;
    private pinataApiSecret: string;

    constructor() {
        // Get API keys from environment variables
        this.pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
        this.pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET || '';

        if (!this.pinataApiKey || !this.pinataApiSecret) {
            console.warn('Pinata API keys not found. IPFS functionality will be limited.');
        }
    }

    /**
     * Validates that required Pinata API keys are configured
     * @throws Error if API keys are not configured
     */
    private checkApiKeys(): void {
        if (!this.pinataApiKey || !this.pinataApiSecret) {
            throw new Error('Pinata API keys not configured. Please set NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_API_SECRET in your .env.local file.');
        }
    }

    /**
     * Generates metadata for an NFT
     * @param name Name of the NFT
     * @param description Description of the NFT
     * @param imageCID IPFS CID of the NFT image
     * @param color Brand color attribute
     * @param issuer Issuer name attribute
     * @returns Metadata object formatted for NFT standards
     */
    generateMetadata(name: string, description: string, imageCID: string, color: string, issuer: string) {
        return {
            name: name,
            description: description,
            image: `ipfs://${imageCID}`,
            attributes: [
                { trait_type: "Brand Color", value: color },
                { trait_type: "Issuer", value: issuer }
            ]
        };
    }

    /**
     * Uploads a file to IPFS using Pinata
     * @param file File object to upload
     * @returns Promise resolving to IPFS hash (CID) of the uploaded file
     * @throws Error if upload fails or API is not configured
     */
    async uploadFile(file: File): Promise<string> {
        this.checkApiKeys();
        
        try {
            const formData = new FormData();
            formData.append('file', file);

            const metadata = JSON.stringify({
                name: file.name,
            });
            formData.append('pinataMetadata', metadata);

            const options = JSON.stringify({
                cidVersion: 0,
            });
            formData.append('pinataOptions', options);

            const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
                method: 'POST',
                headers: {
                    pinata_api_key: this.pinataApiKey,
                    pinata_secret_api_key: this.pinataApiSecret,
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.IpfsHash;
        } catch (error) {
            console.error('Error uploading to IPFS:', error);
            throw new Error('Failed to upload file to IPFS. Please check your Pinata API credentials.');
        }
    }

    /**
     * Uploads JSON data to IPFS using Pinata
     * @param jsonData JSON data to upload
     * @returns Promise resolving to IPFS hash (CID) of the uploaded JSON
     * @throws Error if upload fails or API is not configured
     */
    async uploadJSON(jsonData: unknown): Promise<string> {
        this.checkApiKeys();
        
        try {
            const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    pinata_api_key: this.pinataApiKey,
                    pinata_secret_api_key: this.pinataApiSecret,
                },
                body: JSON.stringify(jsonData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.IpfsHash;
        } catch (error) {
            console.error('Error uploading JSON to IPFS:', error);
            throw new Error('Failed to upload metadata to IPFS. Please check your Pinata API credentials.');
        }
    }

    /**
     * Gets the Pinata gateway URL for an IPFS hash
     * @param cid IPFS Content Identifier (CID)
     * @returns Public gateway URL for accessing the content
     */
    getGatewayUrl(cid: string): string {
        return `https://gateway.pinata.cloud/ipfs/${cid}`;
    }
}


// const pinataSDK = require('@pinata/sdk');
// const { Readable } = require('stream');

// class IPFSService {
//     constructor() {
//         const apiKey = process.env.PINATA_API_KEY;
//         const apiSecret = process.env.PINATA_API_SECRET;
//         if (!apiKey || !apiSecret) {
//             throw new Error('Pinata API keys not found in environment variables');
//         }
//         this.pinata = new pinataSDK(apiKey, apiSecret);
//     }

//     generateMetadata(name, description, imageCID, color, issuer) {
//         return {
//             name: name,
//             description: description,
//             image: `ipfs://${imageCID}`,
//             attributes: [
//                 { trait_type: "Brand Color", value: color },
//                 { trait_type: "Issuer", value: issuer }
//             ]
//         };
//     }
//     async uploadImage(fileBuffer, fileName) {
//         try {
//             // Convert buffer to readable stream
//             const stream = new Readable();
//             stream.push(fileBuffer);
//             stream.push(null);


//             const options = {
//                 pinataMetadata: {
//                     name: fileName
//                 },
//                 pinataOptions: {
//                     cidVersion: 0
//                 }
//             };

//             const result = await this.pinata.pinFileToIPFS(stream, options);
//             return result.IpfsHash;
//         } catch (error) {
//             console.error('Error uploading to IPFS:', error);
//             throw error;
//         }
//     }

//     async uploadMetadata(metadata) {
//         const result = await this.pinata.pinJSONToIPFS(metadata);
//         return result.IpfsHash;
//     }

//     getGatewayUrl(cid) {
//         return `https://gateway.pinata.cloud/ipfs/${cid}`;
//     }
// }


// module.exports = IPFSService;
// module.exports = IPFSService;
