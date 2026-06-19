const express = require('express');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const Jimp = require("jimp");
const axios = require('axios');

const router = express.Router();

// Ganti URL di bawah ini dengan link GitHub Raw font Arial Narrow milikmu
const FONT_URL = "https://raw.githubusercontent.com/arulzzzxd/database/main/font/arialnarrow.ttf"; 
let fontRegistered = false;

// GET Route Utama API
router.get('/', async (req, res) => {
    const text = req.query.text;

    if (!text) {
        return res.status(400).json({
            status: false,
            message: "Parameter '?text=' wajib diisi pada URL endpoint.",
            example: "/api/brat?text=Atmin%20Ganteng"
        });
    }

    try {
        // 1. Download dan Registrasi Font dari GitHub Raw secara Otomatis (Hanya sekali saja)
        if (!fontRegistered) {
            try {
                const fontRes = await axios.get(FONT_URL, { responseType: 'arraybuffer' });
                GlobalFonts.register(Buffer.from(fontRes.data), 'Narrow');
                fontRegistered = true;
                console.log('[Font Success] Font dari GitHub sukses terdaftar.');
            } catch (err) {
                console.error('[Font Error] Gagal mengambil font dari GitHub:', err.message);
            }
        }

        let width = 512;
        let height = 512;
        let margin = 20;
        let wordSpacing = 50;

        let canvas = createCanvas(width, height);
        let ctx = canvas.getContext("2d");

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);

        let fontSize = 280;
        let lineHeightMultiplier = 1.3;

        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillStyle = "black";
        
        // Menggunakan font 'Narrow' jika sukses diunduh, fallback ke 'sans-serif' jika gagal
        const activeFont = fontRegistered ? 'Narrow' : 'sans-serif';
        ctx.font = `${fontSize}px ${activeFont}`;

        let words = text.split(" ");
        let lines = [];

        let rebuildLines = () => {
            lines = [];
            let currentLine = "";
            for (let word of words) {
                let testLine = currentLine ? `${currentLine} ${word}` : word;
                let lineWidth = ctx.measureText(testLine).width + (currentLine.split(" ").length - 1) * wordSpacing;
                if (lineWidth < width - margin * 2) {
                    currentLine = testLine;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine) {
                lines.push(currentLine);
            }
        };

        rebuildLines();

        // Skala turun ukuran font jika teks melebihi batas tinggi kanvas
        while (lines.length * fontSize * lineHeightMultiplier > height - margin * 2) {
            fontSize -= 2;
            ctx.font = `${fontSize}px ${activeFont}`;
            rebuildLines();
        }

        let lineHeight = fontSize * lineHeightMultiplier;
        let y = margin;

        for (let line of lines) {
            let wordsInLine = line.split(" ");
            let x = margin;
            for (let word of wordsInLine) {
                ctx.fillText(word, x, y);
                x += ctx.measureText(word).width + wordSpacing;
            }
            y += lineHeight;
        }

        // Ambil buffer awal dari @napi-rs/canvas
        let buffer = await canvas.encode("png");

        // Pemrosesan efek blur khas brat menggunakan Jimp
        let image = await Jimp.read(buffer);
        image.blur(3);
        let blurredBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

        // Kirim langsung sebagai file gambar (PNG) ke browser/client
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': blurredBuffer.length,
            'Cache-Control': 'public, max-age=86400, s-maxage=86400'
        });
        res.end(blurredBuffer);

    } catch (e) {
        console.error('[Brat API Error]:', e.message);
        return res.status(500).json({
            status: false,
            code: 500,
            error: e.message
        });
    }
});

module.exports = router;