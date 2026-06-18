const axios = require('axios');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('skia-canvas');
const router = express.Router();

const fontUrl = "https://github.com/googlefonts/noto-emoji/raw/main/fonts/NotoColorEmoji.ttf";
// Menggunakan folder /tmp/ agar aman di Vercel, AWS Lambda, maupun VPS cPanel
const tmpFontPath = path.join('/tmp', 'NotoColorEmoji.ttf'); 
let isFontRegistered = false;
let fontFamilyName = "sans-serif"; // Default jika font eksternal gagal dimuat

async function ensureFont() {
    if (isFontRegistered) return;

    try {
        if (!fs.existsSync(tmpFontPath)) {
            console.log("Mengunduh font...");
            const fontRes = await axios.get(fontUrl, { 
                responseType: "arraybuffer",
                timeout: 10000 // Timeout 10 detik agar tidak menggantung lama
            });
            fs.writeFileSync(tmpFontPath, Buffer.from(fontRes.data));
            console.log("Font berhasil disimpan di /tmp");
        }

        registerFont(tmpFontPath, { family: "EmojiFont" });
        fontFamilyName = "EmojiFont";
        isFontRegistered = true;
    } catch (err) {
        // Jika gagal download font, jangan buat app crash. Gunakan font bawaan sistem.
        console.error("Gagal memuat font eksternal, beralih ke font sistem:", err.message);
        fontFamilyName = "sans-serif"; 
        isFontRegistered = true; // Set true agar tidak mencoba download terus-menerus yang bikin lambat
    }
}

async function generateImage(text) {
    try {
        await ensureFont();

        // Menggunakan URL gambar baru hasil edit
        const imageUrl = "https://files.catbox.moe/wlvb0g.png";

        const imageRes = await axios.get(imageUrl, { 
            responseType: "arraybuffer",
            timeout: 10000 
        });
        const baseImage = await loadImage(Buffer.from(imageRes.data));

        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

        // Koordinat area kertas putih pada gambar baru (Silakan sesuaikan jika kurang presisi)
        const boardX = canvas.width * 0.22;
        const boardY = canvas.height * 0.5;
        const boardWidth = canvas.width * 0.56;
        const boardHeight = canvas.height * 0.25;

        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let fontSize = 32;
        const minFontSize = 12;

        function isTextFit(inputText, size) {
            ctx.font = `bold ${size}px ${fontFamilyName}`;
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

        while (text && !isTextFit(text, fontSize) && fontSize > minFontSize) {
            fontSize -= 2;
        }

        if (text) {
            ctx.font = `bold ${fontSize}px ${fontFamilyName}`;
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

        // Output sebagai PNG agar kualitas text dan gambar template baru tetap tajam
        return await canvas.toBuffer("image/png");

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
            'Content-Type': 'image/png',
            'Content-Length': imageBuffer.length
        });
        res.end(imageBuffer);

    } catch (error) {
        console.error("DETEKSI ERROR LOG:", error); 
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;