const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        // Ambil apikey dari query URL (?apikey=...) ATAU dari bodi Form-Data (-F "apikey=...")
        const apikey = req.query.apikey || req.body.apikey || "arulzxd-keys";

        // 1. Validasi Apikey di Server Lokal Anda
        if (apikey !== "arulzxd-keys") {
            return res.status(403).json({
                status: false,
                message: "Apikey tidak valid."
            });
        }

        // 2. Logika Deteksi Input File (hasFileInput)
        const hasFileInput = req.files && Object.keys(req.files).length > 0 && req.files.file;

        if (!hasFileInput) {
            return res.status(400).json({
                status: false,
                message: "Tidak ada file yang dideteksi. Pastikan parameter berkas dikirim lewat key name 'file'."
            });
        }

        const uploadedFile = req.files.file;

        // 3. Konversi Buffer ke Blob & Bungkus ke FormData Global Node.js (v18+)
        // Cara ini otomatis mengatur multipart boundary dan Content-Length dengan benar
        const blob = new Blob([uploadedFile.data], { type: uploadedFile.mimetype });
        
        const form = new FormData();
        form.append("file", blob, uploadedFile.name);
        form.append("apikey", apikey); 

        // 4. Jalankan scraping/penerusan ke target uploader vvipclouds beserta apikey
        const targetUrl = `https://api-arulzxd-vvipclouds.vercel.app/uploader?apikey=${apikey}`;

        const { data } = await axios.post(targetUrl, form, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                // Jangan set 'Content-Type' secara manual, biar Axios & FormData global yang menanganinya
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        // 5. Kembalikan Response Hasil Uploader Target ke Client
        return res.json({
            status: true,
            creator: "ArulzXD",
            result: data
        });

    } catch (e) {
        // Tangkap error jika target endpoint melempar response error code (misal 404/500)
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
