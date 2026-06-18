const express = require('express');
const axios = require('axios');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const router = express.Router();

// Fungsi mengambil data buffer dari gambar latar belakang (Aman dari 403)
async function getBaseBg() {
    try {
        const response = await axios.get('https://arulz-uploader.vercel.app/files/LhDOTg.png', {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
        });
        return Buffer.from(response.data);
    } catch (error) {
        console.error("Detail Error Download Gambar:", error.message);
        throw new Error("Gagal memuat gambar latar belakang");
    }
}

// Endpoint utama Router
router.get('/', async (req, res) => {
    const text = req.query.text || "";

    try {
        const baseImageBuffer = await getBaseBg();
        const bgImage = await loadImage(baseImageBuffer);

        const canvasSize = 512;
        const canvas = createCanvas(canvasSize, canvasSize);
        const ctx = canvas.getContext('2d');

        // 1. Gambar background utama persegi
        ctx.drawImage(bgImage, 0, 0, canvasSize, canvasSize);

        // Jika tidak ada parameter text, kirim gambar polos langsung
        if (!text) {
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': baseImageBuffer.length,
            });
            return res.end(baseImageBuffer);
        }

        // 2. Simpan state awal canvas sebelum rotasi
        ctx.save();

        // 3. Tentukan koordinat titik pusat kertas putih
        const centerX = canvasSize / 2; 
        const centerY = canvasSize * 0.64; // Set posisi tepat di tengah kertas putih

        // 4. Pindahkan poros ke tengah kertas dan miringkan sejajar kertas (-5 derajat)
        ctx.translate(centerX, centerY);
        ctx.rotate(-0.085);

        // 5. Atur gaya font Brat (Warna Hitam, Tebal)
        ctx.fillStyle = '#000000'; 
        ctx.font = 'bold 32px Arial, sans-serif'; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const maxWidth = 280;  // Batas lebar teks di dalam kertas papan
        const lineHeight = 38; // Jarak renggang antar baris

        // 6. Logika Word-Wrap otomatis (Patah Baris)
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

        // 7. FIX: Tulis teks relatif terhadap titik (0,0) baru setelah di-translate
        // startY dihitung mulai dari minus setengah tinggi total baris agar teks presisi di tengah-tengah
        let startY = 0 - ((lines.length - 1) * lineHeight) / 2;
        for (let i = 0; i < lines.length; i++) {
            // Posisi X diatur ke 0 karena poros utama sudah digeser ke centerX oleh ctx.translate
            ctx.fillText(lines[i], 0, startY + (i * lineHeight));
        }

        // 8. Kembalikan orientasi canvas ke normal
        ctx.restore();

        // 9. Kirim hasil gambar PNG ke client
        const bratBuffer = canvas.toBuffer('image/png');
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': bratBuffer.length,
        });
        res.end(bratBuffer);

    } catch (error) {
        return res.status(500).json({ status: false, error: error.message });
    }
});

module.exports = router;