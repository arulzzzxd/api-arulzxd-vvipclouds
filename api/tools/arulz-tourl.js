/**
 * NAMA SCRAPE  :: ARULZ UPLOADER TO URL (STRICT 4.5MB LIMIT)
 * [•] BASIS        :: arulz-uploader.vercel.app
 * [•] CONVERTED    :: Express Router API
 */

const express = require("express");
const multer = require("multer");
const FormData = require("form-data");
const axios = require("axios");
const path = require("path");

const router = express.Router();

const MAX_FILE_SIZE = 4.5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE }
}).single("file");

const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

// Endpoint UTAMA
router.post("/", (req, res) => {
  upload(req, res, async (err) => {
    // 1. Cek validasi API Key terlebih dahulu (bisa dari query atau dari body setelah multer berjalan)
    const apikey = req.query.apikey || req.body.apikey;
    
    if (!apikey) {
      return res.status(400).json({
        status: false,
        creator: "Arulz-XD",
        message: "API Key mana? masukkan parameter ?apikey"
      });
    }

    // Jalankan validasi value apikey kamu di sini jika diperlukan
    // contoh: if (apikey !== "arulzxd-keys") { ... }

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          status: false,
          error: "Ukuran file terlalu besar! Maksimal ukuran yang diizinkan adalah 4.5 MB."
        });
      }
      return res.status(400).json({ status: false, error: err.message });
    } else if (err) {
      return res.status(500).json({ status: false, error: err.message });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        status: false,
        error: "Missing required 'file' in form-data"
      });
    }

    const started = Date.now();
    const form = new FormData();
    const filename = file.originalname || `upload-${Date.now()}.jpg`;

    form.append("file", file.buffer, {
      filename: filename,
      contentType: file.mimetype
    });

    try {
      const response = await axios.post("https://arulz-uploader.vercel.app/upload", form, {
        headers: {
          ...form.getHeaders(),
          "User-Agent": UA,
          "Origin": "https://arulz-uploader.vercel.app",
          "Referer": "https://arulz-uploader.vercel.app/"
        },
        timeout: 45000
      });

      if (response.data) {
        return res.json({
          status: true,
          code: 200,
          result: typeof response.data === "string" ? { url: response.data } : response.data,
          time_ms: Date.now() - started
        });
      } else {
        throw new Error("Gagal mendapatkan response URL dari uploader target");
      }

    } catch (error) {
      const errorMsg = error.response?.data 
        ? (typeof error.response.data === "object" ? JSON.stringify(error.response.data) : error.response.data) 
        : error.message;

      return res.status(error.response?.status || 500).json({
        status: false,
        code: error.response?.status || 500,
        error: errorMsg,
        time_ms: Date.now() - started
      });
    }
  });
});

router.status = "ready";
router.type = "free";
module.exports = router;