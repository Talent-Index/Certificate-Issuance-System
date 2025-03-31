/*const axios = require("axios");
require("dotenv").config();

async function mintPOAP(recipient, eventId) {
    const apiKey = process.env.POAP_API_KEY; // Get from POAP Admin
    const data = {
        event_id: eventId,
        address: recipient,
        secret_code: 123456, // Pre-generated code from POAP Admin
        email: "user@example.com"
    };

    try {
        const response = await axios.post("https://api.poap.xyz/actions/claim-qr", data, {
            headers: { "X-API-Key": apiKey }
        });
        return response.data; 
    } catch (error) {
        console.error("Error issuing POAP:", error.response?.data || error.message);
        throw new Error("Failed to issue POAP");
    }
}

module.exports = mintPOAP;
*/


