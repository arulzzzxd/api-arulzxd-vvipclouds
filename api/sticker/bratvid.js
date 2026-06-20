const express = require("express");
const { bratVid } = require("brat-canvas/video");

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
                example: "/api/sticker/bratvid?apikey=arulzxd-keys&text=mending+tidur+gweh+mah"
            });
        }

        // 3. Proses Rendering murni dari teks menjadi Buffer Video MP4
        const videoBuffer = await bratVid(text, {
            outputFormat: "mp4"
        });

        if (!videoBuffer) {
            throw new Error("Gagal me-render video brat.");
        }

        // 4. Set Header dan Kirim Respons data binary Video MP4 ke Client
        // Menghilangkan proses 'writeFile' agar langsung tersaji di browser/dashboard tanpa beban penyimpanan
        res.setHeader("Content-Type", "video/mp4");
        return res.send(videoBuffer);

    } catch (error) {
        res.status(500).json({
            status: false,
            creator: "ArulzXD",
            error: error.message,
            details: "Terjadi kesalahan internal saat memproses data binary video."
        });
    }
});

module.exports = router;