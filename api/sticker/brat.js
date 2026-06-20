const express = require("express");
const { brat } = require("brat-canvas");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const text = req.query.text;
        const mode = req.query.mode || "image"; // Default ke image jika tidak diisi

        // Validasi parameter text
        if (!text) {
            return res.status(400).json({
                status: false,
                message: "Parameter 'text' diperlukan.",
                example: "/api/canvas/brat?text=kamu brat banget&mode=image"
            });
        }

        // Memproses berdasarkan mode yang diminta oleh user
        if (mode === "image") {
            // Menghasilkan Buffer gambar PNG
            const imageBuffer = await brat(text, { mode: "image" });
            
            // Mengatur header agar dikenal sebagai gambar PNG
            res.setHeader("Content-Type", "image/png");
            return res.send(imageBuffer);

        } else if (mode === "gif") {
            // Menghasilkan Buffer animasi GIF (Progressive Text Reveal)
            const gifBuffer = await brat(text, { mode: "gif" });

            res.setHeader("Content-Type", "image/gif");
            return res.send(gifBuffer);

        } else if (mode === "video" || mode === "mp4") {
            // Menghasilkan Buffer video MP4 (Progressive Text Reveal)
            const videoBuffer = await brat(text, { mode: "video" });

            res.setHeader("Content-Type", "video/mp4");
            return res.send(videoBuffer);

        } else {
            // Jika mode yang dimasukkan tidak valid
            return res.status(400).json({
                status: false,
                message: "Mode tidak valid. Gunakan 'image', 'gif', atau 'video'."
            });
        }

    } catch (error) {
        res.status(500).json({
            status: false,
            creator: "ArulzXD",
            error: error.message,
            details: error.response?.data || null
        });
    }
});

module.exports = router;