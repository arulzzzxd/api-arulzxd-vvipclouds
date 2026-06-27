const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const apikey = req.query.apikey;

        // 1. Validasi Apikey di Server Lokal Anda
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

        // 2. Logika Deteksi Input File (hasFileInput)
        const hasFileInput = req.files && Object.keys(req.files).length > 0 && req.files.file;

        if (!hasFileInput) {
            return res.status(400).json({
                status: false,
                message: "Tidak ada file yang dideteksi. Pastikan parameter berkas dikirim lewat key name 'file'."
            });
        }

        const uploadedFile = req.files.file;

        // 3. Konversi Buffer ke Blob & Bungkus ke FormData Global Node.js
        // Ini membuat Axios otomatis menyusun Multipart Headers & Boundary dengan benar
        const blob = new Blob([uploadedFile.data], { type: uploadedFile.mimetype });
        
        const form = new FormData();
        form.append("file", blob, uploadedFile.name);
        form.append("apikey", apikey); // Meneruskan apikey ke body target jika dibutuhkan

        // 4. Eksekusi Scraping / Penerusan Target URL
        const targetUrl = `https://api-arulzxd-vvipclouds.vercel.app/uploader?apikey=${apikey}`;

        const { data } = await axios.post(targetUrl, form, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                // CATATAN: Jangan set 'Content-Type' manual. Axios + FormData otomatis menanganinya.
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
