const pinataSDK = require('@pinata/sdk');
const { Readable } = require('stream');

class IPFSService {
    constructor() {
        const apiKey = process.env.PINATA_API_KEY;
        const apiSecret = process.env.PINATA_API_SECRET;
        if (!apiKey || !apiSecret) {
            throw new Error('Pinata API keys not found in environment variables');
        }
        this.pinata = new pinataSDK(apiKey, apiSecret);
    }

    generateMetadata(name, description, imageCID, color, issuer) {
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
    async uploadImage(fileBuffer, fileName) {
        try {
            // Convert buffer to readable stream
            const stream = new Readable();
            stream.push(fileBuffer);
            stream.push(null);


            const options = {
                pinataMetadata: {
                    name: fileName
                },
                pinataOptions: {
                    cidVersion: 0
                }
            };

            const result = await this.pinata.pinFileToIPFS(stream, options);
            return result.IpfsHash;
        } catch (error) {
            console.error('Error uploading to IPFS:', error);
            throw error;
        }
    }

    async uploadMetadata(metadata) {
        const result = await this.pinata.pinJSONToIPFS(metadata);
        return result.IpfsHash;
    }

    getGatewayUrl(cid) {
        return `https://gateway.pinata.cloud/ipfs/${cid}`;
    }
}


module.exports = IPFSService;
