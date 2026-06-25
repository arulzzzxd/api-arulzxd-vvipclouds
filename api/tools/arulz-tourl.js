const axios = require('axios');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const FormData = require('form-data');

// Menggunakan memoryStorage agar tidak memenuhi disk server
const upload = multer({ storage: multer.memoryStorage() });

// Konfigurasi API KEY (Disamakan dengan index.js Anda)
const VALID_API_KEY = "arulzxd-keys"; 
const PREMIUM_API_KEYS = ["arulz-premium", "key-vip-arulz", "owner-key-999"]; 

/**
 * Fungsi Scraper / Forwarder ke arulz-uploader
 */
async function scrapeUploader(fileBuffer, filename, mimetype) {
    try {
        const form = new FormData();
        form.append('file', fileBuffer, {
            filename: filename,
            contentType: mimetype,
        });

        const targetUrl = 'https://arulz-uploader.vercel.app/api/upload';
        const response = await axios.post(targetUrl, form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Origin': 'https://arulz-uploader.vercel.app',
                'Referer': 'https://arulz-uploader.vercel.app/'
            }
        });

        return response.data;
    } catch (error) {
        throw error;
    }
}

// ENDPOINT UTAMA - POST
// Kita pasang `upload.single('file')` di paling awal supaya Express bisa membaca req.body dan req.query dari tipe form-data
router.post('/', upload.single('file'), async (req, res) => {
    try {
        // Ambil apikey dari mana saja: Query URL (?apikey=), Body form-data, atau Header HTTP
        const apikey = req.query.apikey || req.body.apikey || req.headers['x-api-key'];

        // 1. Validasi Keberadaan API Key
        if (!apikey) {
            return res.status(400).json({
                status: false,
                creator: "Arulz-XD",
                message: "API Key mana? masukkan parameter ?apikey atau masukkan ke form-body"
            });
        }

        // 2. Validasi Kecocokan API Key
        const isValidFree = apikey === VALID_API_KEY;
        const isValidPremium = PREMIUM_API_KEYS.includes(apikey);

        if (!isValidFree && !isValidPremium) {
            return res.status(403).json({
                status: false,
                creator: "Arulz-XD",
                message: "API Key salah atau tidak terdaftar!"
            });
        }

        // 3. Validasi File
        if (!req.file) {
            return res.status(400).json({ 
                status: false, 
                creator: "Arulz-XD",
                message: "Tidak ada file yang diunggah. Gunakan form-key bernama 'file'" 
            });
        }

        // 4. Proses Eksekusi Scrape Upload
        const result = await scrapeUploader(req.file.buffer, req.file.originalname, req.file.mimetype);
        
        // 5. Berikan Response Sukses
        return res.status(200).json({
            status: true,
            creator: "Arulz-XD",
            result: result
        });

    } catch (error) {
        const errorMsg = error.response ? error.response.data : error.message;
        return res.status(500).json({ 
            status: false, 
            creator: "Arulz-XD",
            error: errorMsg 
        });
    }
});

router.status = "ready"; 
router.type = "free";
module.exports = router;
