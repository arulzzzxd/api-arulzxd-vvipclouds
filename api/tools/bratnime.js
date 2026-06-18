const axios = require('axios');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('skia-canvas');
const router = express.Router();

const fontUrl = "https://github.com/googlefonts/noto-emoji/raw/main/fonts/NotoColorEmoji.ttf";
const tmpFontPath = path.join(__dirname, 'NotoColorEmoji.ttf'); // atau gunakan '/tmp/NotoColorEmoji.ttf' jika di server serverless seperti Vercel/AWS
let isFontRegistered = false;

// Fungsi helper untuk memastikan font sudah terunduh dan terdaftar sebelum request diproses
async function ensureFont() {
    if (isFontRegistered) return;

    try {
        // Unduh font jika belum ada di lokal
        if (!fs.existsSync(tmpFontPath)) {
            const fontRes = await axios.get(fontUrl, { responseType: "arraybuffer" });
            fs.writeFileSync(tmpFontPath, Buffer.from(fontRes.data));
        }

        // Daftarkan font menggunakan path file string (bukan buffer)
        registerFont(tmpFontPath, { family: "EmojiFont" });
        isFontRegistered = true;
    } catch (err) {
        console.error("Gagal memuat font:", err);
        throw new Error("Font initialization failed");
    }
}

// Fungsi memproses gambar
async function generateImage(text) {
    try {
        // Pastikan font sudah siap sebelum lanjut
        await ensureFont();

        const imageUrl = "https://files.catbox.moe/wlvb0g.png";

        // Unduh gambar dasar langsung ke buffer
        const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
        const baseImage = await loadImage(Buffer.from(imageRes.data));

        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

        // Area tempat tulisan
        const boardX = canvas.width * 0.22;
        const boardY = canvas.height * 0.5;
        const boardWidth = canvas.width * 0.56;
        const boardHeight = canvas.height * 0.25;

        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let fontSize = 32;
        const minFontSize = 12;

        // Cek apakah teks muat
        function isTextFit(inputText, size) {
            ctx.font = `bold ${size}px EmojiFont`;
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

        // Gambar teks jika ada
        if (text) {
            ctx.font = `bold ${fontSize}px EmojiFont`;
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

        // Mengembalikan buffer gambar JPEG
        return await canvas.toBuffer("image/jpeg");

    } catch (error) {
        throw error;
    }
}

// Endpoint
router.get('/', async (req, res) => {
    try {
        const text = req.query.text;
        const imageBuffer = await generateImage(text);

        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': imageBuffer.length
        });
        res.end(imageBuffer);

    } catch (error) {
        console.error(error); // Menampilkan detail error di console log server
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;