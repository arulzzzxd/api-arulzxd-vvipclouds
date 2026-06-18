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

        // 2. Atur gaya font Brat (Warna Hitam, Tebal)
        ctx.fillStyle = '#000000'; 
        ctx.font = 'bold 34px Arial, sans-serif'; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const maxWidth = 280;  // Batas lebar teks di dalam kertas papan
        const lineHeight = 40; // Jarak renggang antar baris

        // 3. Logika Word-Wrap otomatis (Patah Baris)
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

        // 4. JIKA TEKS ADA: Lakukan kemiringan tanpa menggunakan metode translate (0,0)
        ctx.save();
        
        // Geser sedikit rotasi global canvas sebesar -5 derajat
        ctx.rotate(-0.085); 

        // 5. Tulis teks dengan koordinat konvensional yang sudah disesuaikan dengan efek rotasi murni
        // Karena canvas dirotasi ke kiri, posisi X harus digeser agak ke kiri (225) dan Y disesuaikan (365) agar pas di tengah kertas
        const posX = 225; 
        const posY = 365; 

        let startY = posY - ((lines.length - 1) * lineHeight) / 2;
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], posX, startY + (i * lineHeight));
        }

        ctx.restore();

        // 6. Kirim hasil gambar PNG ke client
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