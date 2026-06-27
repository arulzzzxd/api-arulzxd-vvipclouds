const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        // Jika req.query.apikey tidak diisi oleh user, otomatis isi dengan "arulzxd-keys"
        const apikey = req.query.apikey || "arulzxd-keys";

        // Validasi Apikey tetap berjalan untuk mengamankan komunikasi ke target uploader
        if (apikey !== "arulzxd-keys") {
            return res.status(403).json({
                status: false,
                message: "Apikey tidak valid."
            });
        }

        // Logika Deteksi Input File (hasFileInput)
        const hasFileInput = req.files && Object.keys(req.files).length > 0 && req.files.file;

        if (!hasFileInput) {
            return res.status(400).json({
                status: false,
                message: "Tidak ada file yang dideteksi. Pastikan parameter berkas dikirim lewat key name 'file'."
            });
        }

        const uploadedFile = req.files.file;

        // Konversi Buffer ke Blob & Bungkus ke FormData Global Node.js
        const blob = new Blob([uploadedFile.data], { type: uploadedFile.mimetype });
        
        const form = new FormData();
        form.append("file", blob, uploadedFile.name);
        form.append("apikey", apikey); 

        // Jalankan scraping ke target uploader vvipclouds
        const targetUrl = `https://api-arulzxd-vvipclouds.vercel.app/uploader?apikey=${apikey}`;

        const { data } = await axios.post(targetUrl, form, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        return res.json({
            status: true,
            creator: "ArulzXD",
            result: data
        });

    } catch (e) {
        if (e.response && e.response.data) {
            return res.status(e.response.status || 500).json(e.response.data);
        }

        return res.status(500).json({
            status: false,
            message: "Gagal memproses scraping uploader",
            error: e.message
        });
    }
});

router.status = "ready"; 
router.type = "free";
module.exports = router;
