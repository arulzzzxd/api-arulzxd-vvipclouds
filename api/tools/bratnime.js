const express = require('express');
const axios = require('axios');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const router = express.Router();

// Fungsi mengambil gambar latar belakang
async function getBgImage() {
    try {
        // Menggunakan URL gambar utama kamu
        const response = await axios.get('https://files.catbox.moe/pgnxr0.jpeg', { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } catch (error) {
        throw new Error("Gagal memuat gambar latar belakang");
    }
}

// Endpoint utama Router
router.get('/', async (req, res) => {
    const text = req.query.text || "";

    try {
        const baseImageBuffer = await getBgImage();
        const bgImage = await loadImage(baseImageBuffer);

        // 1. MEMBUAT CANVAS PERSEGI (1:1 Ratio) - Standar Stiker/Brat 512x512
        const canvasSize = 512;
        const canvas = createCanvas(canvasSize, canvasSize);
        const ctx = canvas.getContext('2d');

        // 2. LOGIKA CENTER CROP (Memotong gambar asli menjadi persegi pas di tengah)
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = bgImage.width;
        let sourceHeight = bgImage.height;

        if (bgImage.width > bgImage.height) {
            // Jika gambar melebar, potong bagian samping kanan-kiri
            sourceWidth = bgImage.height;
            sourceX = (bgImage.width - bgImage.height) / 2;
        } else if (bgImage.height > bgImage.width) {
            // Jika gambar memanjang ke bawah, potong bagian atas-bawah
            sourceHeight = bgImage.width;
            sourceY = (bgImage.height - bgImage.width) / 2;
        }

        // Gambar background hasil crop persegi ke canvas 512x512
        ctx.drawImage(
            bgImage, 
            sourceX, sourceY, sourceWidth, sourceHeight, // Koordinat & ukuran potong dari file asli
            0, 0, canvasSize, canvasSize                // Digambar penuh ke area canvas baru
        );

        // JIKA TIDAK ADA TEKS, langsung kirimkan hasil gambar yang sudah persegi polosan
        if (!text) {
            const pureBuffer = canvas.toBuffer('image/png');
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': pureBuffer.length,
            });
            return res.end(pureBuffer);
        }

        // 3. SETTING FONT TEKS (Hitam, Tebal, Rata Tengah menyesuaikan Gambar 2)
        ctx.fillStyle = '#000000'; 
        ctx.font = 'bold 36px Arial, sans-serif'; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 4. KOORDINAT TITIK TENGAH KERTAS PUTIH (Setelah dicrop persegi)
        // Koordinat ini diset presisi di tengah kertas putih yang dipegang karakter
        const centerX = canvasSize / 2;
        const centerY = canvasSize * 0.65; // Jatuh di sekitar area tengah bawah kertas (65% dari atas)
        const maxWidth = 320;              // Batas lebar teks agar tidak keluar dari tepi kertas putih
        const lineHeight = 42;             // Jarak antar baris kalimat jika teks panjang

        // 5. LOGIKA AUTOMATIC WORD-WRAP (Turun Baris Otomatis Rata Tengah)
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';

        for (let n = 0; n < words.length; n++) {
            let testLine = currentLine + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                lines.push(currentLine.trim());
                currentLine = words[n] + ' ';
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine.trim());

        // 6. RENDERING TEKS KE ATAS KERTAS
        let startY = centerY - ((lines.length - 1) * lineHeight) / 2;
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], centerX, startY + (i * lineHeight));
        }

        // 7. EXPORT BUFFER DAN KIRIM RESPONS GAMBAR
        const bratBuffer = canvas.toBuffer('image/png');
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': bratBuffer.length,
        });
        res.end(bratBuffer);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;