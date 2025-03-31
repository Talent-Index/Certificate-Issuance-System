/*
import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

const uploadToIPFS = async (data: object): Promise<string> => {
    const formData = new FormData();
    formData.append("file", Buffer.from(JSON.stringify(data)));

    const response = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", formData, {
        headers: {
            "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
    });

    return `https://ipfs.io/ipfs/${response.data.IpfsHash}`;
};

export default uploadToIPFS;
*/