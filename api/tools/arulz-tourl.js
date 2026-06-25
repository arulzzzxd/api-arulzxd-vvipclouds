const axios = require('axios');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const FormData = require('form-data');

// Menggunakan memoryStorage agar file tidak disimpan di penyimpanan lokal, melainkan di memori RAM sementara
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Fungsi untuk mengunggah file hasil scrape langsung ke backend arulz-uploader
 * @param {Buffer} fileBuffer - Buffer dari file asli
 * @param {string} filename - Nama asli file
 * @param {string} mimetype - Tipe file (contoh: image/png)
 */
async function scrapeUploader(fileBuffer, filename, mimetype) {
    try {
        const form = new FormData();
        // Masukkan buffer file dan meta datanya ke dalam form data
        form.append('file', fileBuffer, {
            filename: filename,
            contentType: mimetype,
        });

        // Tembak langsung ke API upload milik arulz-uploader
        const targetUrl = 'https://arulz-uploader.vercel.app/api/upload';
        const response = await axios.post(targetUrl, form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Origin': 'https://arulz-uploader.vercel.app',
                'Referer': 'https://arulz-uploader.vercel.app/'
            }
        });

        return response.data; // Mengembalikan response data bawaan dari web arulz-uploader
    } catch (error) {
        throw error;
    }
}

// Endpoint utama Router menggunakan POST karena menerima upload file
// Menggunakan middleware upload.single('file') dengan form-key bernama 'file'
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                status: false, 
                message: "Tidak ada file yang diunggah. Gunakan form-key 'file'" 
            });
        }

        // Jalankan fungsi scrape dengan mengirimkan buffer data file
        const result = await scrapeUploader(req.file.buffer, req.file.originalname, req.file.mimetype);
        
        // Kembalikan hasilnya ke client dalam format JSON sesuai hasil dari target
        res.status(200).json({
            status: true,
            creator: "ArulzXD",
            result: result
        });
    } catch (error) {
        const errorMsg = error.response ? error.response.data : error.message;
        return res.status(500).json({ 
            status: false, 
            error: errorMsg 
        });
    }
});

router.status = "ready"; 
router.type = "free";
module.exports = router;
