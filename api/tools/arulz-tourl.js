const express = require("express");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const apikey = req.query.apikey;
        
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

        // 3. Siapkan Form Data untuk di-forward
        const form = new FormData();
        form.append("file", buffer, {
            filename: filename,
            contentType: mimetype
        });

        // 4. Kirim ke URL Uploader Baru Anda
        const { data } = await axios.post(
            "https://api-arulzxd-vvipclouds.vercel.app/uploader",
            form,
            {
                headers: {
                    ...form.getHeaders()
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
