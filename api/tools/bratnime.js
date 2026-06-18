const express = require('express');
const axios = require('axios');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const router = express.Router();

// Fungsi mengambil data buffer dari gambar latar belakang (Bebas Error 403)
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

        // 1. Inisialisasi Canvas Persegi 512x512
        const canvasSize = 512;
        const canvas = createCanvas(canvasSize, canvasSize);
        const ctx = canvas.getContext('2d');

        // 2. Gambar background utama
        ctx.drawImage(bgImage, 0, 0, canvasSize, canvasSize);

        // Jika tidak ada parameter text, kirim gambar polos langsung
        if (!text) {
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': baseImageBuffer.length,
            });
            return res.end(baseImageBuffer);
        }

        // 3. Simpan state canvas sebelum melakukan rotasi posisi
        ctx.save();

        // 4. Tentukan titik pusat rotasi (Titik tengah area kertas putih)
        // Koordinat ini disesuaikan dengan posisi kertas pada gambar LhDOTg.png
        const centerX = canvasSize / 2 - 2; 
        const centerY = canvasSize * 0.67; 

        // 5. Pindahkan poros koordinat ke tengah kertas dan miringkan canvas
        // Kertas agak miring ke kiri, kita gunakan sudut sekitar -5 derajat (-0.085 Radian)
        ctx.translate(centerX, centerY);
        ctx.rotate(-0.085);

        // 6. Konfigurasi Teks Gaya Brat (Warna Hitam, Tebal, Rata Tengah)
        ctx.fillStyle = '#000000'; 
        ctx.font = 'bold 34px Arial, sans-serif'; // Ukuran font disesuaikan agar pas di kertas
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const maxWidth = 290;  // Batas lebar teks agar tidak menabrak jari karakter
        const lineHeight = 40; // Jarak spasi antar baris kalimat

        // 7. Logika Word-Wrap otomatis (Patah Baris)
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

        // 8. Cetak teks baris demi baris (Posisi X dan Y relatif terhadap titik translate 0,0)
        let startY = 0 - ((lines.length - 1) * lineHeight) / 2;
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], 0, startY + (i * lineHeight));
        }

        // 9. Kembalikan state canvas ke awal
        ctx.restore();

        // 10. Render hasil akhir ke dalam format PNG dan kirim responsnya
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