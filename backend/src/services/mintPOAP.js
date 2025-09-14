/*const axios = require("axios");
require("dotenv").config();

/**
 * Mints a POAP token using the POAP API
 * @param {string} recipient Ethereum address of the recipient
 * @param {string} eventId ID of the POAP event
 * @returns {Promise<object>} Response data containing the POAP claim information
 * @throws {Error} If the POAP minting fails
 */
// async function mintPOAP(recipient, eventId) {
//     const apiKey = process.env.POAP_API_KEY; // Get from POAP Admin
//     const data = {
//         event_id: eventId,
//         address: recipient,
//         secret_code: 123456, // Pre-generated code from POAP Admin
//         email: "user@example.com"
//     };

//     try {
//         const response = await axios.post("https://api.poap.xyz/actions/claim-qr", data, {
//             headers: { "X-API-Key": apiKey }
//         });
//         return response.data; 
//     } catch (error) {
//         console.error("Error issuing POAP:", error.response?.data || error.message);
//         throw new Error("Failed to issue POAP");
//     }
// }

// module.exports = mintPOAP;
// */


