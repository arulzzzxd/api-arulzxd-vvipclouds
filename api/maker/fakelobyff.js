const express = require("express");
const axios = require("axios");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");

const router = express.Router();

const FONT_URL =
"https://raw.githubusercontent.com/arulzzzxd/database/main/font/TeutonNormal.otf";

let fontLoaded = false;

// Hanya menggunakan aset gambar dari Template 5
const TEMPLATE_IMAGE_URL = "https://files.catbox.moe/cuatgd.jpg";

// Konfigurasi posisi untuk Template 5 (Koordinat Y dinaikkan agar teks pas di tengah banner)
const templateConfig = { 
  x: 627, 
  y: 1025, 
  size: 85 
};

async function loadFont() {
  if (fontLoaded) return;

  const { data } = await axios.get(FONT_URL, {
    responseType: "arraybuffer"
  });

  GlobalFonts.register(
    Buffer.from(data),
    "TeutonNormal"
  );

  fontLoaded = true;
}

router.get("/", async (req, res) => {
  try {
    const name = String(req.query.name || "ArulzXD");

    await loadFont();

    // Mengambil data gambar Template 5
    const { data } = await axios.get(TEMPLATE_IMAGE_URL, {
      responseType: "arraybuffer"
    });

    const image = await loadImage(Buffer.from(data));

    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, 0, 0, image.width, image.height);

    let fontSize = templateConfig.size;

    // Auto-scaling ukuran font berdasarkan panjang nickname agar tidak keluar banner
    if (name.length > 8) fontSize *= 0.9;
    if (name.length > 12) fontSize *= 0.8;
    if (name.length > 16) fontSize *= 0.7;

    ctx.font = `${Math.floor(fontSize)}px TeutonNormal`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Warna teks emas dengan stroke hitam tebal khas Free Fire
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#FFD700";

    ctx.lineWidth = Math.max(4, Math.floor(fontSize / 15));

    ctx.strokeText(name, templateConfig.x, templateConfig.y);
    ctx.fillText(name, templateConfig.x, templateConfig.y);

    const buffer = await canvas.encode("jpeg");

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      error: err.message
    });
  }
});

module.exports = router;