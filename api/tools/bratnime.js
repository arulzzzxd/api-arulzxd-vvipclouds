const axios = require('axios');
const express = require('express');
const { createCanvas, loadImage } = require('skia-canvas'); // Jika skia-canvas tetap crash di Vercel, ganti ke library 'canvas'
const router = express.Router();

// Fungsi memproses gambar
async function generateImage(text) {
    try {
        // Gunakan URL gambar template memegang kertas kosong
        const imageUrl = "https://files.catbox.moe/wlvb0g.png";

        // Unduh gambar dasar langsung ke buffer dengan timeout ketat
        const imageRes = await axios.get(imageUrl, { 
            responseType: "arraybuffer",
            timeout: 8000 // 8 detik maks
        });
        const baseImage = await loadImage(Buffer.from(imageRes.data));

        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

        // Koordinat area kertas putih
        const boardX = canvas.width * 0.22;
        const boardY = canvas.height * 0.5;
        const boardWidth = canvas.width * 0.56;
        const boardHeight = canvas.height * 0.25;

        // Gunakan font standar sistem Linux yang dipastikan ada di server Vercel (Arial / Sans-Serif)
        // Menghindari download font eksternal berukuran besar yang bikin Vercel timeout 500
        const fontFamily = "Arial, sans-serif"; 

        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let fontSize = 32;
        const minFontSize = 12;

        // Cek apakah teks muat
        function isTextFit(inputText, size) {
            ctx.font = `bold ${size}px ${fontFamily}`;
            const words = inputText.split(" ");
            const lineHeight = size * 1.2;
            const maxWidth = boardWidth * 0.9;
            const lines = [];
            let currentLine = words[0] || "";

            for (let i = 1; i < words.length; i++) {
                const testLine = currentLine + " " + words[i];
                const testWidth = ctx.measureText(testLine).width;
                if (testWidth > maxWidth) {
                    lines.push(currentLine);
                    currentLine = words[i];
                } else {
                    currentLine = testLine;
                }
            }
            lines.push(currentLine);
            return lines.length * lineHeight <= boardHeight * 0.9;
        }

        // Sesuaikan ukuran font
        while (text && !isTextFit(text, fontSize) && fontSize > minFontSize) {
            fontSize -= 2;
        }

        // Gambar teks jika parameter text diisi
        if (text) {
            ctx.font = `bold ${fontSize}px ${fontFamily}`;
            const words = text.split(" ");
            const lineHeight = fontSize * 1.2;
            const maxWidth = boardWidth * 0.9;
            const lines = [];
            let currentLine = words[0] || "";

            for (let i = 1; i < words.length; i++) {
                const testLine = currentLine + " " + words[i];
                const testWidth = ctx.measureText(testLine).width;
                if (testWidth > maxWidth) {
                    lines.push(currentLine);
                    currentLine = words[i];
                } else {
                    currentLine = testLine;
                }
            }
            lines.push(currentLine);

            const startY = boardY + boardHeight / 2 - (lines.length - 1) * lineHeight / 2;
            lines.forEach((line, i) => {
                ctx.fillText(line, boardX + boardWidth / 2, startY + i * lineHeight);
            });
        }

        // Kembalikan sebagai PNG buffer
        return await canvas.toBuffer("image/png");

    } catch (error) {
        throw error;
    }
}

// Endpoint /api/tools/bratnime
router.get('/', async (req, res) => {
    try {
        const text = req.query.text;
        
        // Validasi input text agar tidak memproses string kosong/undefined yang merusak canvas
        if (!text) {
            return res.status(400).json({ error: "Parameter 'text' wajib diisi!" });
        }

        const imageBuffer = await generateImage(text);

        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': imageBuffer.length,
            'Cache-Control': 'public, max-age=86400' // Tambahkan cache agar Vercel tidak bekerja keras di request yang sama
        });
        res.end(imageBuffer);

    } catch (error) {
        console.error("VERCEL_ERROR_LOG:", error.message);
        return res.status(500).json({ 
            error: "Internal Server Error", 
            details: error.message 
        });
    }
});

module.exports = router;