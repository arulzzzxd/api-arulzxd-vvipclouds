const express = require('express');
const axios = require('axios');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const router = express.Router();

// Fungsi untuk mengunduh gambar background spesifik dari Catbox
async function getCatboxBg() {
    try {
        const response = await axios.get('https://files.catbox.moe/pgnxr0.jpeg', { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } catch (error) {
        throw new Error("Gagal memuat gambar latar belakang dari Catbox");
    }
}

// Endpoint utama Router
router.get('/', async (req, res) => {
    const text = req.query.text || "";

    try {
        // 1. Ambil data buffer gambar dari link catbox yang kamu berikan
        const baseImageBuffer = await getCatboxBg();

        // Jika user tidak mengisi parameter ?text=, kirim gambar polosannya langsung
        if (!text) {
            res.writeHead(200, {
                'Content-Type': 'image/jpeg',
                'Content-Length': baseImageBuffer.length,
            });
            return res.end(baseImageBuffer);
        }

        // 2. Load buffer gambar ke dalam objek Canvas Image
        const bgImage = await loadImage(baseImageBuffer);

        // 3. Inisialisasi Canvas Kotak standar Brat/Stiker (512x512 piksel)
        const canvas = createCanvas(512, 512);
        const ctx = canvas.getContext('2d');

        // 4. Gambar background secara proporsional mengisi area kotak 512x512
        ctx.drawImage(bgImage, 0, 0, 512, 512);

        // 5. Tambahkan lapisan overlay gelap transparan (45%) agar teks Brat putih kontras dan terbaca jelas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, 0, 512, 512);

        // 6. Konfigurasi font teks tebal khas Brat Style
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 46px Arial, sans-serif'; 
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // 7. Logika otomatis Word-Wrap (turun baris jika teks melebihi lebar maksimal canvas)
        const words = text.split(' ');
        let line = '';
        let x = 45;       // Jarak margin kiri teks
        let y = 45;       // Jarak margin atas teks
        const maxWidth = 422;   // Lebar maksimal area teks sebelum patah baris
        const lineHeight = 55;  // Jarak renggang antar baris kalimat

        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);

        // 8. Export hasil akhir canvas menjadi buffer gambar PNG
        const bratBuffer = canvas.toBuffer('image/png');

        // 9. Kirim response gambar Brat ke client
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