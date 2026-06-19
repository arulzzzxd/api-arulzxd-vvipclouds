const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const router = express.Router();

const imageUrls = {
    1:  'https://cloud-fukushima.vercel.app/uploader/8fjhd6ftps.jpg',
    2:  'https://cloud-fukushima.vercel.app/uploader/oz8hb4ow75.jpg',
    3:  'https://cloud-fukushima.vercel.app/uploader/tvz1cie8df.jpg',
    4:  'https://cloud-fukushima.vercel.app/uploader/yo9sg4vmo3.jpg',
    5:  'https://files.catbox.moe/cuatgd.jpg',
    6:  'https://files.catbox.moe/kfl1lb.jpg',
    7:  'https://files.catbox.moe/8vyh2k.jpg',
    8:  'https://files.catbox.moe/jxzw2r.jpg',
    9:  'https://files.catbox.moe/mmgua4.jpg',
    10: 'https://files.catbox.moe/rcgn6z.jpg',
    11: 'https://files.catbox.moe/v2np8h.jpg'
};

const TOTAL = Object.keys(imageUrls).length;

router.get('/', async (req, res) => {
    const num = req.query.template;
    const name = req.query.name;

    // Validasi parameter query input
    if (!num || !name) {
        return res.status(400).json({
            status: false,
            message: "Format parameter salah. Dibutuhkan '?template=' dan '?name='.",
            example: "/api/fakeff?template=5&name=Kyuu"
        });
    }

    const imageUrl = imageUrls[parseInt(num)];
    if (!imageUrl) {
        return res.status(404).json({
            status: false,
            message: `Template [ ${num} ] tidak tersedia. Pilih rentang angka 1-${TOTAL}.`
        });
    }

    // Mengubah path font agar dinamis membaca dari folder project kamu saat ini
    // Silakan buat folder 'fonts' di root project dan taruh berkas 'TeutonNormal.otf' di sana.
    const fontPath = path.join(process.cwd(), 'fonts', 'TeutonNormal.otf');
    
    if (!fs.existsSync(fontPath)) {
        return res.status(500).json({
            status: false,
            message: "Font sistem 'TeutonNormal.otf' tidak ditemukan di folder /fonts/."
        });
    }

    const timestamp     = Date.now();
    const tempImagePath = path.join(process.cwd(), `tmp_raw_${timestamp}.jpg`);
    const outputPath    = path.join(process.cwd(), `tmp_ff_${timestamp}.jpg`);

    const cleanup = () => {
        [tempImagePath, outputPath].forEach(f => {
            if (fs.existsSync(f)) fs.unlinkSync(f);
        });
    };

    try {
        // 1. Download Gambar Template
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(tempImagePath, Buffer.from(response.data));

        // 2. Hitung Rasio Ukuran Font Berdasarkan Panjang Nama
        const nameLen  = name.length;
        const fontSize = nameLen <= 6 ? 'w*0.055' : nameLen <= 10 ? 'w*0.045' : 'w*0.035';
        const safeName = name.trim().replace(/'/g, "\\'").replace(/:/g, '\\:');

        // 3. Susun Perintah FFmpeg
        const ffCmd = [
            'ffmpeg -y',
            `-i "${tempImagePath}"`,
            `-vf "drawtext=fontfile='${fontPath}':text='${safeName}':x=((w-text_w)/2)+(w*0.02):y=h*0.80-(text_h/2):fontsize=${fontSize}:fontcolor=yellow:shadowcolor=black:shadowx=3:shadowy=3"`,
            `-q:v 2`,
            `"${outputPath}"`
        ].join(' ');

        // 4. Eksekusi FFmpeg
        await new Promise((resolve, reject) => {
            exec(ffCmd, (err, stdout, stderr) => {
                if (err) reject(new Error(stderr || err.message));
                else resolve();
            });
        });

        // 5. Baca Hasil Akhir Output Gambar FFmpeg
        const imageBuffer = fs.readFileSync(outputPath);

        // 6. Kirim Response Murni Berupa File Image JPG ke Client
        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': imageBuffer.length,
            'Cache-Control': 'public, max-age=86400'
        });
        res.end(imageBuffer);

        // Bersihkan file temporary setelah sukses terkirim
        cleanup();

    } catch (e) {
        cleanup();
        console.error('[fakeff-api-error]', e);
        res.status(500).json({
            status: false,
            error: e.message
        });
    }
});

module.exports = router;