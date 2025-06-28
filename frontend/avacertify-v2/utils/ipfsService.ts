// Browser-compatible IPFS service using Pinata
import axios from 'axios'
require('dotenv').config();


export class IPFSService {
    private pinataApiKey: string;
    private pinataApiSecret: string;

    constructor() {
        // In a real app, you would get these from environment variables
        // For browser security, consider using a backend proxy
        this.pinataApiKey = process.env.PINATA_API_KEY || '';
        this.pinataApiSecret = process.env.PINATA_API_SECRET || '';

        // Only throw error if running on server (Node.js)
        if (typeof window === "undefined" && (!this.pinataApiKey || !this.pinataApiSecret)) {
            throw new Error('Pinata API keys not found in environment variables');
        }
        // In the browser, allow instantiation, but API calls will fail if keys are not set
        this.pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
        this.pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET|| '';
    }

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

    async uploadFile(file: File): Promise<string> {
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

            const res = await axios.post(
                "https://api.pinata.cloud/pinning/pinFileToIPFS",
                formData,
                {
                    headers: {
                        'Content-Type': `multipart/form-data;`,
                        pinata_api_key: this.pinataApiKey,
                        pinata_secret_api_key: this.pinataApiSecret,
                    },
                }
            );

            return res.data.IpfsHash;
        } catch (error) {
            console.error('Error uploading to IPFS:', error);
            throw error;
        }
    }

    async uploadJSON(jsonData: any): Promise<string> {
        try {
            const res = await axios.post(
                "https://api.pinata.cloud/pinning/pinJSONToIPFS",
                jsonData,
                {
                    headers: {
                        pinata_api_key: this.pinataApiKey,
                        pinata_secret_api_key: this.pinataApiSecret,
                    },
                }
            );

            return res.data.IpfsHash;
        } catch (error) {
            console.error('Error uploading JSON to IPFS:', error);
            throw error;
        }
    }

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
