const express = require("express");
const { bratVid } = require("brat-canvas/video");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const apikey = req.query.apikey;
        const text = req.query.text;
        let mode = req.query.mode || "gif"; // Default ke gif

        // Toleransi typo dari dashboard jika mengetik "gift"
        if (mode === "gift") mode = "gif";

        // 1. Validasi Apikey
        if (!apikey) {
            return res.status(403).json({ 
                status: false, 
                message: "Parameter 'apikey' diperlukan." 
            });
        }
        if (apikey !== "arulzxd-keys") {
            return res.status(403).json({ 
                status: false, 
                message: "Apikey tidak valid." 
            });
        }

        // 2. Validasi Parameter Text
        if (!text) {
            return res.status(400).json({
                status: false,
                message: "Parameter 'text' diperlukan.",
                example: "/api/sticker/bratvid?apikey=arulzxd-keys&text=Hai+semua&mode=gif"
            });
        }

        // 3. Validasi Mode
        if (mode !== "gif" && mode !== "video" && mode !== "mp4") {
            return res.status(400).json({
                status: false,
                message: "Mode tidak valid. Gunakan 'gif' atau 'video'."
            });
        }

        // 4. Memproses Text menjadi Animasi menggunakan brat-canvas/video
        // Mengikuti format internal library yang mengembalikan Buffer/File data
        const outputFormat = mode === "gif" ? "gif" : "mp4";
        const videoBuffer = await bratVid(text, {
            outputFormat: outputFormat
        });

        if (!videoBuffer) {
            throw new Error("Gagal me-render frame animasi brat.");
        }

        // 5. Mengirimkan Response Header & Data ke Client
        if (outputFormat === "gif") {
            res.setHeader("Content-Type", "image/gif");
        } else {
            res.setHeader("Content-Type", "video/mp4");
        }

        return res.send(videoBuffer);

    } catch (error) {
        res.status(500).json({
            status: false,
            creator: "ArulzXD",
            error: error.message,
            details: "Terjadi kesalahan internal saat memproses rendering media brat."
        });
    }
});

module.exports = router;