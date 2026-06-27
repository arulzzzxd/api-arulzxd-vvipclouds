const axios = require('axios');
const express = require('express');
const router = express.Router();

// Fungsi untuk mengambil gambar acak berdasarkan kategori pilihan
async function getRandomPic(category) {
    try {
        const url = `https://raw.githubusercontent.com/arulzzzxd/database/main/randompics/${category}.json`;
        const { data } = await axios.get(url);
        
        let parsedData = data;
        if (typeof data === 'string') {
            parsedData = JSON.parse(data);
        }

        // --- AMAN DARI OBJECT/ARRAY MISMATCH ---
        let urls = [];
        if (Array.isArray(parsedData)) {
            urls = parsedData;
        } else if (parsedData && typeof parsedData === 'object') {
            // Jika data berupa objek, cari key yang berisi array (misal: parsedData.result atau parsedData[category])
            const dynamicKey = Object.keys(parsedData).find(key => Array.isArray(parsedData[key]));
            if (dynamicKey) {
                urls = parsedData[dynamicKey];
            } else {
                // Jika tidak ada key array, ambil semua nilai string/url dari objek tersebut
                urls = Object.values(parsedData).filter(val => typeof val === 'string' && val.startsWith('http'));
            }
        }

        if (urls.length === 0) {
            throw new Error(`Data array gambar tidak ditemukan atau kosong di file ${category}.json`);
        }

        // Memilih satu URL gambar acak dari list array yang sudah valid
        const randomUrl = urls[Math.floor(Math.random() * urls.length)];

        // Mengambil file gambar asli
        const response = await axios.get(randomUrl, { 
            responseType: 'arraybuffer',
            timeout: 10000 // Timeout 10 detik agar tidak gantung jika link mati
        });
        
        return {
            buffer: Buffer.from(response.data),
            contentType: response.headers['content-type'] || 'image/png'
        };
    } catch (error) {
        // Meneruskan pesan error spesifik agar gampang di-debug di console dashboard terminal Anda
        console.error("Error at getRandomPic:", error.message);
        throw error;
    }
}

// Endpoint utama Router
router.get('/', async (req, res) => {
    try {
        const category = req.query.category || 'aesthetic';
        const imageResult = await getRandomPic(category);
        
        res.writeHead(200, {
            'Content-Type': imageResult.contentType,
            'Content-Length': imageResult.buffer.length,
        });
        res.end(imageResult.buffer);
    } catch (error) {
        // Mengembalikan pesan detail error asli ke client untuk mempermudah pengecekan
        return res.status(500).json({ 
            status: false, 
            error: error.message 
        });
    }
});

// Konfigurasi metadata kustom untuk dibaca oleh index.js
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
