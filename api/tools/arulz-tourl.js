const express = require('express');
const router = express.Router();
const multer = require('multer');

// Konfigurasi Multer penyimpanan sementara (memory/disk)
const upload = multer({ storage: multer.memoryStorage() });

// Properti status dan type untuk sinkronisasi dokumentasi di index.js
router.status = "ready";
router.type = "free"; // atau "premium"

// Menggunakan upload.single('file') untuk memproses form-data berkey 'file'
router.post('/', upload.single('file'), (req, res) => {
    try {
        // PERINGATAN: Harus eksplisit menulis 'req.file' atau 'req.body' di dalam fungsi 
        // agar regex / string matching di index.js dapat mendeteksinya!
        if (!req.file) {
            return res.status(400).json({
                status: false,
                message: "Tidak ada file yang diunggah!"
            });
        }

        // Contoh membaca data file buffer
        const fileBuffer = req.file.buffer;
        const fileName = req.file.originalname;
        const fileSize = req.file.size;

        // Logika uploader Anda di sini (misal upload ke Imgur, Catbox, dll)
        // ...

        res.json({
            status: true,
            creator: "Arulz-XD",
            result: {
                name: fileName,
                size: fileSize,
                url: `https://arulz-uploader.vercel.app/files/contoh_output.jpg`
            }
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
});

module.exports = router;
