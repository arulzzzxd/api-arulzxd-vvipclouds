const express = require("express");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const apikey = req.query.apikey;
        
        // 1. Validasi Apikey Lokal
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

        // 2. Validasi File Upload (express-fileupload)
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

        // 3. Siapkan Form Data
        const form = new FormData();
        form.append("file", buffer, {
            filename: filename,
            contentType: mimetype
        });

        // 4. Kirim ke URL Uploader Target (Ditambahkan penerusan apikey & headers palsu browser)
        const targetUrl = `https://api-arulzxd-vvipclouds.vercel.app/uploader?apikey=${apikey}`;
        
        const { data } = await axios.post(
            targetUrl,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            }
        );

        // 5. Kembalikan Response Hasil Upload ke Client
        return res.json({
            status: true,
            creator: "ArulzXD",
            result: data
        });

    } catch (e) {
        // Log detail di terminal panel biar Anda bisa lacak isi body error dari target server jika ada
        if (e.response) {
            console.error("[Target Server Error Data]:", e.response.data);
        }

        return res.status(500).json({
            status: false,
            message: "Gagal meneruskan berkas ke server uploader",
            error: e.message,
            detail: e.response ? e.response.data : "No detail from target server"
        });
    }
});

router.status = "ready"; 
router.type = "free";
module.exports = router;
