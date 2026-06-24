

const axios = require('axios');
const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const router = express.Router();

// Konfigurasi penyimpanan sementara di memori (RAM)
const upload = multer({ storage: multer.memoryStorage() });

// Fungsi Scraper Arulz Uploader
async function scrapeUploader(fileBuffer, fileName, mimeType) {
  try {
    const form = new FormData();
    // Sesuaikan key field 'file' dengan yang dibutuhkan oleh target website
    form.append('file', fileBuffer, {
      filename: fileName,
      contentType: mimeType,
    });

    const response = await axios.post("https://arulz-uploader.vercel.app/api/upload", form, {
      headers: {
        ...form.getHeaders(),
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36",
        "Referer": "https://arulz-uploader.vercel.app/",
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Endpoint POST Utama
// Menerima input file dengan nama field 'file'
router.post('/', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "Missing 'file' parameter di body request" });

  try {
    // Mengeksekusi fungsi upload/scrape
    const result = await scrapeUploader(file.buffer, file.originalname, file.mimetype);

    // Response disesuaikan dengan struktur standard yang kamu inginkan
    return res.json({
      status: true,
      data: {
        nama_file: file.originalname,
        ukuran: file.size,
        tipe: file.mimetype,
        // Menampilkan hasil response dari arulz-uploader (biasanya berisi URL file)
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