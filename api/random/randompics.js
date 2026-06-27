const axios = require('axios');
const express = require('express');
const router = express.Router();

// Fungsi untuk mengambil gambar acak berdasarkan kategori pilihan
async function getRandomPic(category) {
    try {
        // Mengarah ke file JSON spesifik sesuai kategori di repositori github Anda
        const url = `https://raw.githubusercontent.com/arulzzzxd/database/main/randompics/${category}.json`;
        const { data } = await axios.get(url);
        
        let urls = data;
        if (typeof data === 'string') {
            urls = JSON.parse(data);
        }

        if (!Array.isArray(urls) || urls.length === 0) {
            throw new Error("Kategori kosong atau tidak ditemukan");
        }

        // Memilih satu URL gambar acak dari list array
        const randomUrl = urls[Math.floor(Math.random() * urls.length)];

        // Mengambil file gambar asli
        const response = await axios.get(randomUrl, { responseType: 'arraybuffer' });
        
        return {
            buffer: Buffer.from(response.data),
            contentType: response.headers['content-type'] || 'image/png'
        };
    } catch (error) {
        throw error;
    }
}

// Endpoint utama Router
router.get('/', async (req, res) => {
    try {
        // Mengambil query category, jika kosong default ke 'aesthetic'
        const category = req.query.category || 'aesthetic';
        
        const imageResult = await getRandomPic(category);
        
        res.writeHead(200, {
            'Content-Type': imageResult.contentType,
            'Content-Length': imageResult.buffer.length,
        });
        res.end(imageResult.buffer);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Konfigurasi metadata kustom untuk dibaca oleh index.js (Fitur Dropdown Select)
router.paramsConfig = {
    category: {
        type: "select",
        options: [
            "aesthetic", "antiwork", "bike", "blackpink", "boneka", 
            "car", "cat", "cosplay", "doggo", "justina", 
            "kayes", "kpop", "notnot", "ppcouple", "profile", 
            "pubg", "rose", "ryujin", "ulzzangboy"
        ]
    }
};

router.status = "ready"; 
router.type = "free";
module.exports = router;
