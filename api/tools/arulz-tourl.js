/**
 * NAMA SCRAPE  :: ARULZ UPLOADER API
 * [•] PEMBUAT      :: DEFAN (dipastebin.web.id)
 * [•] BASIS        :: api-arulzxd-vvipclouds.vercel.app
 */

const axios = require('axios');
const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const router = express.Router();

// Konfigurasi penyimpanan sementara di memori (RAM)
const upload = multer({ storage: multer.memoryStorage() });

// Fungsi Scraper Arulz Uploader dengan API Key di URL
async function scrapeUploader(fileBuffer, fileName, mimeType, apiKey) {
  try {
    const form = new FormData();
    // Berdasarkan gambar, nama field input filenya adalah 'file'
    form.append('file', fileBuffer, {
      filename: fileName,
      contentType: mimeType,
    });

    // API Key disisipkan langsung ke dalam URL (?apikey=...) sesuai kebutuhan sistemnya
    const response = await axios.post(`https://api-arulzxd-vvipclouds.vercel.app/api/tools/arulz-tourl?apikey=${apiKey}`, form, {
      headers: {
        ...form.getHeaders(),
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36",
        "Referer": "https://api-arulzxd-vvipclouds.vercel.app/",
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Endpoint POST Utama
router.post('/', upload.single('file'), async (req, res) => {
  const file = req.file;
  // Mengambil apikey dari body request (bisa diganti default jika ingin hardcode)
  const apiKey = req.body.apikey || "arulzxd-keys"; 

  if (!file) return res.status(400).json({ error: "Missing 'file' parameter di body request" });

  try {
    // Eksekusi fungsi scraper
    const result = await scrapeUploader(file.buffer, file.originalname, file.mimetype, apiKey);

    // Mengembalikan response hasil upload
    return res.json({
      status: true,
      data: {
        nama_file: file.originalname,
        ukuran: file.size,
        tipe: file.mimetype,
        result: result 
      }
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.status = "ready"; 
router.type = "free";
module.exports = router;