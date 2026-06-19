const express = require('express');
const axios = require('axios');

const router = express.Router();

// GET Route Utama API sesuai path /api/sticker/bratv1
router.get('/', async (req, res) => {
    const text = req.query.text;
    const type = req.query.type || 'image'; // Default jika tidak diisi adalah image

    // 1. Validasi parameter teks
    if (!text) {
        return res.status(400).json({
            status: false,
            message: "Parameter '?text=' wajib diisi pada URL endpoint.",
            example: "/api/sticker/bratv1?type=image&text=Cewe+cantik"
        });
    }

    // 2. Validasi tipe media yang didukung
    const allowedTypes = ['image', 'video', 'gif'];
    if (!allowedTypes.includes(type)) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'type' tidak valid. Pilih salah satu: 'image', 'video', atau 'gif'."
        });
    }

    try {
        // Menentukan base API URL eksternal berdasarkan tipe media
        const externalApiUrl = `https://fareldevelopers-brat.hf.space/${type}?text=${encodeURIComponent(text)}`;

        // Request data dari Hugging Face Space dengan format arraybuffer
        const response = await axios.get(externalApiUrl, {
            responseType: 'arraybuffer',
            timeout: 15000, // batasan waktu 15 detik agar tidak menggantung jika HF overload
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        // Menentukan Content-Type header response berdasarkan tipe media
        let contentType = 'image/png'; 
        if (type === 'video' || type === 'gif') {
            contentType = 'video/mp4'; // Brat video/gif dari HF space dikirim berbentuk MP4
        }

        // Mengirimkan buffer media murni langsung ke browser/client
        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': response.data.length,
            'Cache-Control': 'public, max-age=86400, s-maxage=86400'
        });
        
        return res.end(Buffer.from(response.data));

    } catch (e) {
        console.error('[Brat Multi API Error]:', e.message);
        
        // FIX: Jika axios mendapatkan error saat responseType 'arraybuffer', 
        // e.response.data berbentuk Buffer. Kita harus mengubahnya kembali ke teks/string.
        let errorMessage = e.message;
        let statusCode = 500;

        if (e.response) {
            statusCode = e.response.status;
            if (e.response.data) {
                try {
                    const parsedError = JSON.parse(Buffer.from(e.response.data).toString('utf-8'));
                    errorMessage = parsedError.detail || parsedError.message || errorMessage;
                } catch (_) {
                    errorMessage = Buffer.from(e.response.data).toString('utf-8') || errorMessage;
                }
            }
        }

        return res.status(statusCode).json({
            status: false,
            code: statusCode,
            message: "Gagal mengambil data dari server Brat utama (HuggingFace Space kemungkinan overload/down).",
            error: errorMessage
        });
    }
});

module.exports = router;