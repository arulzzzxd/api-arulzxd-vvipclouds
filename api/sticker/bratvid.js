const express = require("express");
const axios = require("axios");

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
                example: "/api/sticker/bratvidhd?apikey=arulzxd-keys&text=mending+tidur+gweh+mah"
            });
        }

        // 3. Mengambil data dari upstream API Brat Video
        // Menambahkan parameter mode=gif (jika didukung upstream) atau melakukan stream binary GIF
        const targetUrl = `https://api.deline.web.id/maker/bratvid?text=${encodeURIComponent(text)}&mode=gif`;

        const response = await axios({
            method: "get",
            url: targetUrl,
            responseType: "arraybuffer",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        });

        // 4. Set Header untuk Animasi GIF dan kirimkan datanya langsung ke client
        res.setHeader("Content-Type", "image/gif");
        return res.send(response.data);

    } catch (error) {
        res.status(500).json({
            status: false,
            creator: "ArulzXD",
            error: error.message,
            details: "Gagal memproses data animasi GIF dari server upstream."
        });
    }
});

router.status = "error"; 
router.type = "free";
module.exports = router;