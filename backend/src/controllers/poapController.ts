/*import mintPOAP from "../services/mintPOAP";

export const issuePOAP = async (req, res) => {
    try {
        const { recipientAddress, eventId } = req.body;
        if (!recipientAddress || !eventId) {
            return res.status(400).json({ error: "Missing recipientAddress or eventId" });
        }

        const poapData = await mintPOAP(recipientAddress, eventId);
        res.json({
            success: true,
            poapLink: poapData.qr_code, // Mint link
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error issuing POAP" });
    }
};
*/