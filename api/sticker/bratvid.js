const express = require("express");
const { brat } = require("brat-canvas");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const apikey = req.query.apikey;
        const text = req.query.text;
        const mode = req.query.mode || "gif"; // Default ke 'gif' untuk stiker bergerak

        // 1. Validasi Apikey
        if (!apikey) {
            return res.status(403).json({ status: false, message: "Parameter 'apikey' diperlukan." });
        }
        if (apikey !== "arulzxd-keys") {
            return res.status(403).json({ status: false, message: "Apikey tidak valid." });
        }

        // 2. Validasi Parameter Text
        if (!text) {
            return res.status(400).json({
                status: false,
                message: "Parameter 'text' diperlukan.",
                example: "/api/sticker/brat-video?apikey=arulzxd-keys&text=kamu+brat&mode=gif"
            });
        }

        // 3. Menghasilkan animasi Brat menggunakan library brat-canvas secara mandiri
        if (mode === "gif") {
            // Menghasilkan Buffer animasi GIF (Progressive Text Reveal)
            const gifBuffer = await brat(text, { 
                mode: "gif",
                speed: 250, // Kecepatan reveal per kata dalam milidetik (opsional)
            });

            // Set header respons untuk format GIF animasi
            res.setHeader("Content-Type", "image/gif");
            return res.send(gifBuffer);

        } else if (mode === "video" || mode === "mp4") {
            // Menghasilkan Buffer video MP4 (Progressive Text Reveal)
            const videoBuffer = await brat(text, { 
                mode: "video" 
            });

            // Set header respons untuk format Video MP4
            res.setHeader("Content-Type", "video/mp4");
            return res.send(videoBuffer);

        } else {
            return res.status(400).json({
                status: false,
                message: "Mode tidak valid untuk endpoint video ini. Gunakan 'gif' atau 'video'."
            });
        }

    } catch (error) {
        res.status(500).json({
            status: false,
            creator: "ArulzXD",
            error: error.message,
            details: "Terjadi error internal saat menyusun frame video brat."
        });
    }
});

module.exports = router;