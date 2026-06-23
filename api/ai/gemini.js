const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

const ai = new GoogleGenAI({
apiKey: "AQ.Ab8RN6JHsgkZdeSHGhymZ9L1XV8jJQKQyx9HovkX9cVaAdDUQQ"
});

router.get("/", async (req, res) => {
try {
const text = req.query.text?.trim();

    if (!text) {
        return res.status(400).json({
            status: false,
            creator: "ArulzXD",
            message: "Parameter text wajib diisi",
            example: "/api/ai/gemini?text=Halo"
        });
    }

    const response =
        await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: text
        });

    res.json({
        status: true,
        creator: "ArulzXD",
        result: response.text
    });

} catch (err) {
    res.status(500).json({
        status: false,
        creator: "ArulzXD",
        message: err.message
    });
}

});

router.status = "ready";
router.type = "free";

module.exports = router;