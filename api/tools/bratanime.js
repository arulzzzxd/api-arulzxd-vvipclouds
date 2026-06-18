const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
// Menggunakan @napi-rs/canvas
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

const router = express.Router();

// Jalur file font lokal di dalam proyek kamu
// Membaca folder 'fonts' langsung dari root directory project kamu
const fontPath = path.join(process.cwd(), 'fonts', 'NotoColorEmoji.ttf');

let isFontRegistered = false;
let fontStyleFamily = "sans-serif"; // Default fallback jika font ttf gagal dimuat

function ensureFontIsRegistered() {
    if (isFontRegistered) return;

    try {
        // Cek apakah file font ttf benar-benar ada di server Vercel
        if (fs.existsSync(fontPath)) {
            const registered = GlobalFonts.registerFromPath(fontPath, "EmojiFont");
            if (registered) {
                fontStyleFamily = "EmojiFont";
                isFontRegistered = true;
                console.log("SUKSES: Font lokal berhasil terdaftar.");
            }
        } else {
            console.warn("PERINGATAN: File font ttf tidak ditemukan di server Vercel. Menggunakan font sistem bawaan.");
            fontStyleFamily = "sans-serif"; // Menggunakan font Linux bawaan server Vercel agar tidak crash 500
            isFontRegistered = true; 
        }
    } catch (e) {
        console.error("Gagal memuat font ttf, beralih ke font sistem:", e.message);
        fontStyleFamily = "sans-serif";
        isFontRegistered = true;
    }
}

// Endpoint Utama
router.get('/', async (req, res) => {
    const text = req.query.text;

    if (!text) {
        return res.status(400).json({
            status: false,
            creator: "Arulzxd",
            message: "Masukkan teks untuk gambar pada parameter '?text='."
        });
    }

    try {
        // Jalankan pengecekan ketersediaan font
        ensureFontIsRegistered();

        let imageUrl = "https://files.catbox.moe/wlvb0g.png";

        // 1. Ambil data buffer gambar latar belakang
        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });
        const imageBuffer = Buffer.from(response.data);

        // 2. Load gambar ke dalam canvas menggunakan Buffer
        const baseImage = await loadImage(imageBuffer);
        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext("2d");

        // 3. Gambar background utama
        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

        // --- LOGIKAL CANVAS ASLI KAMU (Menggunakan fontStyleFamily dinamik) ---
        let boardX = canvas.width * 0.22;
        let boardY = canvas.height * 0.5;
        let boardWidth = canvas.width * 0.56;
        let boardHeight = canvas.height * 0.25;

        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        let maxFontSize = 32;
        let minFontSize = 12;
        let fontSize = maxFontSize;

        function splitText(text, currentFontSize) {
            ctx.font = `bold ${currentFontSize}px ${fontStyleFamily}`;
            let words = text.split(" ");
            let lineHeight = currentFontSize * 1.2;
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
            return lines;
        }

        while (fontSize > minFontSize) {
            let lines = splitText(text, fontSize);
            let textHeight = lines.length * (fontSize * 1.2);
            if (textHeight <= boardHeight * 0.9) break;
            fontSize -= 2;
        }

        let finalLines = splitText(text, fontSize);
        let lineHeight = fontSize * 1.2;

        let startY = boardY + boardHeight / 2 - (finalLines.length - 1) * lineHeight / 2;
        finalLines.forEach((line, i) => {
            ctx.fillText(line, boardX + boardWidth / 2, startY + i * lineHeight);
        });
        // --- AKHIR LOGIKAL CANVAS ---

        // 4. Ekstrak canvas langsung ke format buffer png di dalam memori
        const pngBuffer = await canvas.toBuffer("image/png");

        // 5. Kirim respons gambar PNG langsung ke client
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