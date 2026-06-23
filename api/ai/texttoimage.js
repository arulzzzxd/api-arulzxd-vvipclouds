const express = require("express");
const fetch = require("node-fetch");

const router = express.Router();

// ==========================================
// CORE FUNCTIONS (SCRAPER)
// ==========================================

async function generateImage(Prompt, style) {
    const postResponse = await fetch('https://aicharalab.com/api/character/character-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
            'Referer': 'https://aicharalab.com/ghibli-ai-generator'
        },
        body: JSON.stringify({
            prompts: Prompt,
            negative: "",
            image_style: style,
            style_transfer: 0,
            aspect_ratio: "1:1",
            number: 1
        })
    });

    const postResult = await postResponse.json();
    
    if (!postResult || !postResult.data || !postResult.data.task_id) {
        throw new Error(postResult.message || "Gagal mendapatkan task_id dari server pusat.");
    }
    
    const taskId = postResult.data.task_id;
    let attempts = 0;
    const maxAttempts = 30; // Batasan agar tidak infinite loop jika server macet (30 * 2 detik = 60 detik)

    while (attempts < maxAttempts) {
        const getResponse = await fetch(`https://aicharalab.com/api/dash/task-status?task_id=${taskId}&project_name=character`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
                'Referer': 'https://aicharalab.com/ghibli-ai-generator'
            }
        });

        const getResult = await getResponse.json();
        
        if (getResult.status === 100000 && getResult.data && getResult.data.result && getResult.data.result[0]) {
            return getResult.data.result[0]; // Mengembalikan URL gambar (.png/.jpg)
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000)); 
    }
    
    throw new Error("Proses pembuat gambar memakan waktu terlalu lama (Timeout).");
}

// ==========================================
// EXPRESS ROUTER ENDPOINT
// ==========================================

router.get("/", async (req, res) => {
    try {
        const text = req.query.text;
        const type = req.query.type || 'anime';

        // Validasi parameter text
        if (!text) {
            return res.status(400).json({
                status: false,
                message: "Masukkan parameter 'text' untuk prompt. Contoh: ?text=goku+cool"
            });
        }

        // Mapping model berdasarkan parameter type
        let styleStyle;
        switch (type.toLowerCase()) {
            case 'anime':
                styleStyle = "anime";
                break;
            case 'ghibli':
                styleStyle = "ghibli";
                break;
            case 'pixel':
                styleStyle = "pixel art";
                break;
            default:
                return res.status(400).json({
                    status: false,
                    message: "Tipe tidak valid. Pilih antara: 'anime', 'ghibli', atau 'pixel'."
                });
        }

        // Jalankan fungsi generator gambar untuk mengambil URL gambarnya
        const imageUrl = await generateImage(text, styleStyle);

        // Ambil data gambar (buffer) dari URL eksternal agar bisa di-stream langsung ke client
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) throw new Error("Gagal mengunduh gambar hasil generate.");
        
        const imageBuffer = await imageResponse.buffer();
        const contentType = imageResponse.headers.get("content-type") || "image/png";

        // Kirim response berupa file gambar langsung
        res.setHeader("Content-Type", contentType);
        return res.send(imageBuffer);

    } catch (error) {
        // Penanganan error internal agar aman dari crash / error 500 yang tidak terduga
        return res.status(500).json({
            status: false,
            creator: "ArulzXD",
            error: error.message
        });
    }
});

router.status = "ready";
router.type = "free";
module.exports = router;