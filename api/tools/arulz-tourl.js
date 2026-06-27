const express = require("express");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        // 1. Validasi File Upload (express-fileupload)
        if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
            return res.status(400).json({
                status: false,
                message: "Tidak ada file yang diunggah. Pastikan key name form-data adalah 'file'."
            });
        }

        const uploadedFile = req.files.file;
        const buffer = uploadedFile.data;
        const filename = uploadedFile.name;
        const mimetype = uploadedFile.mimetype;

        // 2. Siapkan Form Data
        const form = new FormData();
        form.append("file", buffer, {
            filename: filename,
            contentType: mimetype
        });

        const targetUrl = `https://api-arulzxd-vvipclouds.vercel.app/uploader`;

        // 3. Kirim ke URL Uploader Target dengan Headers Tambahan + Content-Length yang Valid
        const { data } = await axios.post(
            targetUrl,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    // PENTING: Menghitung ukuran asli form untuk mencegah chunked encoding error di target server
                    "Content-Length": form.getLengthSync(),
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                },
                // Tambahkan maxContentLength & maxBodyLength agar tidak error saat upload file berukuran besar
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        // 4. Kembalikan Response Hasil Upload ke Client
        return res.json({
            status: true,
            creator: "ArulzXD",
            result: data
        });

    } catch (e) {
        // Jika server target melempar error berupa objek JSON, tampilkan secara utuh
        if (e.response && e.response.data) {
            return res.status(e.response.status || 500).json(e.response.data);
        }

        return res.status(500).json({
            status: false,
            message: "Gagal meneruskan berkas ke server uploader",
            error: e.message
        });
    }
});

router.status = "ready"; 
router.type = "free";
module.exports = router;
