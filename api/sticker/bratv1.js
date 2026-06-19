const express = require('express');
const axios = require('axios');

const router = express.Router();

// GET Route Utama API
router.get('/', async (req, res) => {
    const text = req.query.text;
    const type = req.query.type || 'image'; // Default jika tidak diisi adalah image

    // Validasi parameter teks
    if (!text) {
        return res.status(400).json({
            status: false,
            message: "Parameter '?text=' wajib diisi pada URL endpoint.",
            example: "/api/bratmulti?type=image&text=Halo%20Zelarixa"
        });
    }

    // Validasi tipe media yang didukung
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
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // Menentukan Content-Type header response berdasarkan tipe media
        let contentType = 'image/png'; // default image
        if (type === 'video' || type === 'gif') {
            contentType = 'video/mp4'; // Brat video/gif biasanya dikirim dalam container MP4
        }

        // Mengirimkan buffer media murni langsung ke browser/client
        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': response.data.length,
            'Cache-Control': 'public, max-age=86400, s-maxage=86400'
        });
        
        res.end(Buffer.from(response.data));

    } catch (e) {
        console.error('[Brat Multi API Error]:', e.message);
        
        // Cek jika error bersumber dari API eksternal yang down/error
        const statusCode = e.response ? e.response.status : 500;
        res.status(statusCode).json({
            status: false,
            message: "Gagal mengambil data dari server Brat utama.",
            error: e.message
        });
    }
});

module.exports = router;