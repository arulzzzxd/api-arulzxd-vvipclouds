const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage, registerFont } = require('skia-canvas');

const router = express.Router();

// PERINGATAN VERCEL: Vercel bersifat read-only.
// Folder unduhan font harus diarahkan ke direktori '/tmp' agar tidak memicu error izin akses.
const fontDir = path.join('/font');
const fontPath = path.join(fontDir, "NotoColorEmoji.ttf");

// Fungsi untuk memastikan Font Emoji tersedia sebelum memproses gambar
async function ensureFontExists() {
    if (!fs.existsSync(fontDir)) {
        fs.mkdirSync(fontDir, { recursive: true });
    }
    if (!fs.existsSync(fontPath)) {
        console.log("Downloading NotoColorEmoji Font...");
        const fontUrl = "https://github.com/googlefonts/noto-emoji/raw/main/fonts/NotoColorEmoji.ttf";
        const fontData = await axios.get(fontUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(fontPath, Buffer.from(fontData.data));
        console.log("Font saved successfully to /tmp.");
    }
    // Daftarkan font ke skia-canvas
    registerFont(fontPath, { family: "EmojiFont" });
}

// Endpoint Utama
router.get('/', async (req, res) => {
    // Mengambil parameter query '?text=' dari URL
    const text = req.query.text;

    if (!text) {
        return res.status(400).json({
            status: false,
            creator: "Arulzxd",
            message: "Masukkan teks untuk gambar pada parameter '?text='."
        });
    }

    try {
        // Pastikan font sudah terunduh & terdaftar sebelum canvas dibuat
        await ensureFontExists();

        let imageUrl = "https://files.catbox.moe/wlvb0g.png";

        // 1. Ambil data buffer gambar latar belakang
        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const imageBuffer = Buffer.from(response.data);

        // 2. Load gambar ke dalam skia-canvas menggunakan Buffer
        const baseImage = await loadImage(imageBuffer);
        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext("2d");

        // 3. Gambar background utama
        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

        // --- LOGIKAL CANVAS ASLI KAMU ---
        let boardX = canvas.width * 0.22;
        let boardY = canvas.height * 0.5;
        let boardWidth = canvas.width * 0.56;
        let boardHeight = canvas.height * 0.25;

        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        let maxFontSize = 32;
        let minFontSize = 12;
        let fontSize = maxFontSize;

        function isTextFit(text, fontSize) {
            ctx.font = `bold ${fontSize}px EmojiFont`;
            let words = text.split(" ");
            let lineHeight = fontSize * 1.2;
            let maxWidth = boardWidth * 0.9;
            let lines = [];
            let currentLine = words[0];
            for (let i = 1; i < words.length; i++) {
                let testLine = currentLine + " " + words[i];
                let testWidth = ctx.measureText(testLine).width;
                if (testWidth > maxWidth) {
                    lines.push(currentLine);
                    currentLine = words[i];
                } else {
                    currentLine = testLine;
                }
            }
            lines.push(currentLine);
            let textHeight = lines.length * lineHeight;
            return textHeight <= boardHeight * 0.9;
        }

        while (!isTextFit(text, fontSize) && fontSize > minFontSize) {
            fontSize -= 2;
        }

        ctx.font = `bold ${fontSize}px EmojiFont`;
        let words = text.split(" ");
        let lineHeight = fontSize * 1.2;
        let maxWidth = boardWidth * 0.9;
        let lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            let testLine = currentLine + " " + words[i];
            let testWidth = ctx.measureText(testLine).width;
            if (testWidth > maxWidth) {
                lines.push(currentLine);
                currentLine = words[i]; // Perbaikan dari words[n] menjadi words[i]
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);

        let startY = boardY + boardHeight / 2 - (lines.length - 1) * lineHeight / 2;
        lines.forEach((line, i) => {
            ctx.fillText(line, boardX + boardWidth / 2, startY + i * lineHeight);
        });
        // --- AKHIR LOGIKAL CANVAS ASLI KAMU ---

        // 4. Ekstrak canvas langsung ke format buffer png di dalam memori
        const pngBuffer = await canvas.toBuffer("image/png");

        // 5. Kirim respons langsung ke client berbentuk file image/png utuh
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': pngBuffer.length,
        });
        res.end(pngBuffer);

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({
            status: false,
            error: error.message
        });
    }
});

module.exports = router;
