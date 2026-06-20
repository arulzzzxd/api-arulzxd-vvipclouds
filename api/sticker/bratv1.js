const express = require("express");
const axios = require("axios");
const { createCanvas, GlobalFonts } = require("@napi-rs/canvas");
const GIFEncoder = require("gifencoder");

const router = express.Router();

// URL Font Arial Narrow dari GitHub Raw agar kompatibel di Vercel
const FONT_URL = "https://raw.githubusercontent.com/arulzzzxd/database/main/font/arialnarrow.ttf";
let isFontRegistered = false;

async function loadFont() {
    if (isFontRegistered) return;
    try {
        const response = await axios.get(FONT_URL, { responseType: "arraybuffer" });
        const fontBuffer = Buffer.from(response.data);
        GlobalFonts.register(fontBuffer, "Narrow");
        isFontRegistered = true;
    } catch (err) {
        throw new Error("Gagal memuat font dari GitHub Raw: " + err.message);
    }
}

// Fungsi pembantu untuk merancang susunan baris teks teks berdasarkan ukuran font saat itu
function getLayoutLines(ctx, text, width, margin, fontSize) {
    const words = text.split(" ");
    let lines = [];
    let currentLine = "";
    
    ctx.font = `${fontSize}px Narrow`;
    
    for (let word of words) {
        let testLine = currentLine ? `${currentLine} ${word}` : word;
        let lineWidth = ctx.measureText(testLine).width;
        
        if (lineWidth < width - margin * 2) {
            currentLine = testLine;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
}

router.get("/", async (req, res) => {
    try {
        const apikey = req.query.apikey;
        const text = req.query.text;

        // 1. Validasi Apikey
        if (!apikey) {
            return res.status(403).json({ status: false, message: "Parameter 'apikey' diperlukan." });
        }
        if (apikey !== "arulzxd-keys") {
            return res.status(403).json({ status: false, message: "Apikey tidak valid." });
        }

        // 2. Validasi Parameter Text
        if (!text) {
            return res.status(400).json({
                status: false,
                message: "Parameter 'text' diperlukan.",
                example: "/api/sticker/brat-animated?apikey=arulzxd-keys&text=teks+animasi+saja"
            });
        }

        // 3. Pastikan font sudah ter-registrasi
        await loadFont();

        const width = 512;
        const height = 512;
        const margin = 30;
        const wordSpacing = 15;
        const lineHeightMultiplier = 1.1;

        // Buat canvas sementara untuk kalkulasi ukuran font optimal
        const baseCanvas = createCanvas(width, height);
        const baseCtx = baseCanvas.getContext("2d");
        
        let fontSize = 200;
        let lines = getLayoutLines(baseCtx, text, width, margin, fontSize);

        // Kecilkan font jika teks meluber ke bawah canvas
        while (lines.length * fontSize * lineHeightMultiplier > height - margin * 2 && fontSize > 20) {
            fontSize -= 2;
            lines = getLayoutLines(baseCtx, text, width, margin, fontSize);
        }

        // Pecah seluruh kata ke dalam susunan koordinat (X, Y) untuk animasi progressive reveal
        let wordsData = [];
        let currentY = margin;
        const lineHeight = fontSize * lineHeightMultiplier;

        for (let line of lines) {
            let wordsInLine = line.split(" ");
            let currentX = margin;
            baseCtx.font = `${fontSize}px Narrow`;
            
            for (let word of wordsInLine) {
                wordsData.push({
                    text: word,
                    x: currentX,
                    y: currentY
                });
                currentX += baseCtx.measureText(word).width + wordSpacing;
            }
            currentY += lineHeight;
        }

        // 4. Setup GIF Encoder untuk membuat teks bergerak
        const encoder = new GIFEncoder(width, height);
        const frames = [];

        encoder.createReadStream().on("data", (chunk) => frames.push(chunk));

        encoder.start();
        encoder.setRepeat(0);      // 0 = Loop terus-menerus
        encoder.setDelay(280);      // Jeda kemunculan per kata (280ms)
        encoder.setQuality(10);     // Optimasi warna/kompresi

        const renderCanvas = createCanvas(width, height);
        const ctx = renderCanvas.getContext("2d");

        // Loop memproses frame demi frame secara bertahap (kata demi kata)
        for (let i = 1; i <= wordsData.length; i++) {
            // Latar belakang putih bersih khas Brat asli
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, width, height);

            // Render teks hitam hanya sampai indeks kata ke-i (efek mengetik/berjalan)
            ctx.fillStyle = "black";
            ctx.font = `${fontSize}px Narrow`;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";

            for (let j = 0; j < i; j++) {
                const word = wordsData[j];
                ctx.fillText(word.text, word.x, word.y);
            }

            encoder.addFrame(ctx);
        }

        // Frame Terakhir: Teks lengkap diberikan jeda baca lebih lama (1.5 detik) sebelum berulang kembali
        encoder.setDelay(1500); 
        encoder.addFrame(ctx);

        encoder.finish();

        // Menggabungkan seluruh buffer frame menjadi file .gif utuh
        const gifBuffer = Buffer.concat(frames);

        // 5. Kirim respon gambar animasi GIF murni ke client
        res.setHeader("Content-Type", "image/gif");
        return res.send(gifBuffer);

    } catch (error) {
        res.status(500).json({
            status: false,
            creator: "ArulzXD",
            error: error.message,
            details: null
        });
    }
});

module.exports = router;