const express = require('express');
const axios = require('axios');
const path = require('path');
// Menggunakan @napi-rs/canvas yang sepenuhnya didukung di Vercel
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

const router = express.Router();

// PERBAIKAN TOTAL: Arahkan langsung ke file font di dalam proyek
// ../fonts/NotoColorEmoji.ttf
const fontPath = path.join(__dirname, '..', 'fonts', 'NotoColorEmoji.ttf');

// Variabel flag untuk memastikan pendaftaran font global hanya terjadi sekali per runtime
let isFontRegistered = false;

function ensureFontIsRegistered() {
    if (isFontRegistered) return;

    // Cara mendaftarkan font lokal di @napi-rs/canvas menggunakan GlobalFonts
    try {
        // Daftarkan font yang sudah ada di proyek
        const registered = GlobalFonts.registerFromPath(fontPath, "EmojiFont");
        if (registered) {
            isFontRegistered = true;
            console.log("Font locally registered from:", fontPath);
        } else {
            throw new Error("Gagal meregistrasi font, pastikan file ada di jalur yang benar.");
        }
    } catch (e) {
        console.error("Fatal Error meregistrasi font lokal:", e.message);
        throw e; // Lemparkan error agar ditangkap blok catch utama
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
        // Pastikan font lokal teregistrasi
        ensureFontIsRegistered();

        let imageUrl = "https://files.catbox.moe/wlvb0g.png";

        // 1. Ambil data buffer gambar latar belakang
        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 8000 // Batas timeout unduhan background 8 detik
        });
        const imageBuffer = Buffer.from(response.data);

        // 2. Load gambar ke dalam canvas menggunakan Buffer
        const baseImage = await loadImage(imageBuffer);
        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext("2d");

        // 3. Gambar background utama
        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

        // --- LOGIKAL CANVAS ASLI KAMU (Optimized) ---
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
            ctx.font = `bold ${currentFontSize}px EmojiFont`;
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

        // Ukuran font yang pas secara vertikal
        while (fontSize > minFontSize) {
            let lines = splitText(text, fontSize);
            let textHeight = lines.length * (fontSize * 1.2);
            if (textHeight <= boardHeight * 0.9) break;
            fontSize -= 2;
        }

        // Lakukan pemisahan teks akhir sesuai ukuran font yang didapat
        let finalLines = splitText(text, fontSize);
        let lineHeight = fontSize * 1.2;

        let startY = boardY + boardHeight / 2 - (finalLines.length - 1) * lineHeight / 2;
        finalLines.forEach((line, i) => {
            ctx.fillText(line, boardX + boardWidth / 2, startY + i * lineHeight);
        });
        // --- AKHIR LOGIKAL CANVAS ---

        // 4. Ekstrak canvas ke buffer PNG
        const pngBuffer = await canvas.toBuffer("image/png");

        // 5. Kirim respons langsung sebagai file gambar
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': pngBuffer.length,
            'Cache-Control': 'public, max-age=86400, s-maxage=86400' // Caching agresif di CDN Vercel agar respons berikutnya instan
        });
        res.end(pngBuffer);

    } catch (error) {
        console.error("Fatal API Error:", error);
        res.status(500).json({
            status: false,
            error: `Gagal memproses gambar. Pastikan file font ada di jalur proyek: ${path.relative(__dirname, fontPath)}`
        });
    }
});

module.exports = router;