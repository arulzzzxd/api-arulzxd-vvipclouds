const express = require("express");
const axios = require("axios");

const router = express.Router();

// Gunakan "/" karena base path "/api/tools/arulz-tourl" sudah diatur di index.js
router.post("/", async (req, res) => {
    try {
        // Deteksi apikey dari Query string atau Body Form-data (Bypass jika kosong)
        const apikey = req.query.apikey || req.body.apikey || "arulzxd-keys";

        // 1. Validasi Apikey
        if (apikey !== "arulzxd-keys") {
            return res.status(403).json({
                status: false,
                message: "Apikey tidak valid."
            });
        }

        // 2. Cek apakah ada file input (hasFileInput) dari express-fileupload
        const hasFileInput = req.files && Object.keys(req.files).length > 0 && req.files.file;

        if (!hasFileInput) {
            return res.status(400).json({
                status: false,
                message: "Tidak ada file yang diunggah. Pastikan key form-data ber-name 'file'."
            });
        }

        const uploadedFile = req.files.file;

        // 3. Ambil global kelas FormData bawaan Node.js (Node.js v18+)
        // Menggunakan Blob dari internal data buffer agar Axios mengenali tipe datanya secara presisi
        const blob = new Blob([uploadedFile.data], { type: uploadedFile.mimetype });
        const form = new FormData();
        
        form.append("file", blob, uploadedFile.name);
        form.append("apikey", apikey);

        // 4. Meneruskan data ke server uploader target
        const targetUrl = `https://api-arulzxd-vvipclouds.vercel.app/uploader?apikey=${apikey}`;

        const { data } = await axios.post(targetUrl, form, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                // Jangan tulis header Content-Type manual agar Axios otomatis menyusun boundary multipart-nya
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        // 5. Kembalikan respons sukses dari server target ke user/client
        return res.json({
            status: true,
            creator: "ArulzXD",
            result: data
        });

    } catch (e) {
        // Tangkap error langsung jika server target bermasalah (misal mengembalikan json error)
        if (e.response && e.response.data) {
            return res.status(e.response.status || 500).json(e.response.data);
        }

        return res.status(500).json({
            status: false,
            message: "Gagal memproses upload ke server uploader target.",
            error: e.message
        });
    }
});

router.status = "ready"; 
router.type = "free";
module.exports = router;
