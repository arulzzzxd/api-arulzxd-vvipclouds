const express = require("express");
const { bratvid } = require("brat-farel");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const apikey = req.query.apikey;
        const text = req.query.text;

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
                example: "/api/sticker/bratvid?apikey=arulzxd-keys&text=Hello+World"
            });
        }

        // 3. Proses Rendering murni dari teks menjadi Buffer GIF menggunakan brat-farel
        // Menggunakan parameter 'blur' dan 'fast' sesuai dokumentasi fungsi test Anda
        const gifBuffer = await bratvid(text, {
            blur: 5,
            fast: true
        });

        if (!gifBuffer) {
            throw new Error("Gagal me-render animasi brat menggunakan brat-farel.");
        }

        // 4. Set Header dan Kirim Respons data binary GIF langsung ke Client / Dashboard
        res.setHeader("Content-Type", "image/gif");
        return res.send(gifBuffer);

    } catch (error) {
        res.status(500).json({
            status: false,
            creator: "ArulzXD",
            error: error.message,
            details: "Terjadi kesalahan internal pada proses rendering brat-farel."
        });
    }
});

module.exports = router;