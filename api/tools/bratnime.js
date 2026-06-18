const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { createCanvas, loadImage, registerFont } = require('skia-canvas');

const router = express.Router();

// Menentukan folder session di root project agar aman dari pembatasan sub-folder Vercel
const fontDir = path.join(process.cwd(), "session");
const fontPath = path.join(fontDir, "NotoColorEmoji.ttf");

// Fungsi pembantu untuk mengunduh Font Emoji jika belum ada
async function ensureFontExists() {
    if (!fs.existsSync(fontDir)) {
        fs.mkdirSync(fontDir, { recursive: true });
    }
    if (!fs.existsSync(fontPath)) {
        console.log("Downloading NotoColorEmoji Font...");
        const fontUrl = "https://github.com/googlefonts/noto-emoji/raw/main/fonts/NotoColorEmoji.ttf";
        const fontData = await axios.get(fontUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(fontPath, Buffer.from(fontData.data));
        console.log("Font saved successfully.");
    }
    // Daftarkan font ke runtime skia-canvas secara global
    registerFont(fontPath, { family: "EmojiFont" });
}

// Jalankan fungsi pengecekan font saat file dimuat
ensureFontExists().catch(err => console.error("Gagal inisialisasi font:", err));

// Endpoint Utama Scrape API Brat
router.get('/', async (req, res) => {
    const text = req.query.text || "";

    if (!text) {
        return res.status(400).json({
            status: false,
            creator: "Arulzxd",
            message: "Masukkan teks pada parameter '?text='."
        });
    }

    try {
        // Gambar beresolusi persegi dari uploader kamu
        let imageUrl = "https://arulz-uploader.vercel.app/files/LhDOTg.png";

        // Ambil data buffer gambar latar belakang
        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const imageBuffer = Buffer.from(response.data);

        // Load gambar ke dalam skia-canvas menggunakan Buffer
        const baseImage = await loadImage(imageBuffer);
        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext("2d");

        // Gambar background utama
        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

        // --- LOGIKAL CANVAS (SUDAH AMAN DARI TYPO WORDS[N]) ---
        let boardX = canvas.width * 0.20;
        let boardY = canvas.height * 0.52;
        let boardWidth = canvas.width * 0.60;
        let boardHeight = canvas.height * 0.24;

        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        let maxFontSize = 34;
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
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);

        let startY = boardY + boardHeight / 2 - (lines.length - 1) * lineHeight / 2;
        lines.forEach((line, i) => {
            ctx.fillText(line, boardX + boardWidth / 2, startY + i * lineHeight);
        });
        // --- AKHIR LOGIKAL CANVAS ---

        // 1. Ambil data mentah buffer JPEG dari skia-canvas
        const canvasBuffer = await canvas.toBuffer("image/jpeg");

        // 2. Optimasi output buffer menjadi gambar biasa (.jpeg) berkualitas tinggi
        const jpegImageBuffer = await sharp(canvasBuffer)
            .toFormat("jpeg", { quality: 95 })
            .toBuffer();

        // 3. Kirim respons sebagai file jpeg murni agar langsung tampil sebagai gambar biasa
        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': jpegImageBuffer.length,
        });
        res.end(jpegImageBuffer);

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({
            status: false,
            error: error.message
        });
    }
});

module.exports = router;