require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const IPFSService = require('./ipfsService');

async function main() {
    try {
        const ipfsService = new IPFSService();
        const imagePath = './Images/Issuer_Dashboard.png'; // Use direct path
        
        // Upload file to IPFS with metadata
        const fileBuffer = await fs.readFile(imagePath);
        const fileName = path.basename(imagePath);
        const logoCID = await ipfsService.uploadImage(fileBuffer, fileName);
        console.log('File CID:', logoCID);

        // Generate and upload metadata
        const metadata = ipfsService.generateMetadata(
            "Certificate Name",
            "Certificate Description",
            logoCID,
            "#FF0000", // Brand color
            "Your Organization Name"
        );

        const metadataCID = await ipfsService.uploadMetadata(metadata);
        console.log('Metadata CID:', metadataCID);
        
        // Get public gateway URLs
        console.log('Logo URL:', ipfsService.getGatewayUrl(logoCID));
        console.log('Metadata URL:', ipfsService.getGatewayUrl(metadataCID));

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();