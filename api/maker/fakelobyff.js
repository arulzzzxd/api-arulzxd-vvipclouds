const express = require("express");
const axios = require("axios");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");

const router = express.Router();

const FONT_URL =
"https://raw.githubusercontent.com/arulzzzxd/database/main/font/TeutonNormal.otf";

let fontLoaded = false;

// Menggunakan aset gambar dari Template 5 sesuai di screenshot
const TEMPLATE_IMAGE_URL = "https://files.catbox.moe/cuatgd.jpg";

// PERBAIKAN: Koordinat disesuaikan agar teks masuk ke dalam banner abu-abu/kuning di bawah kaki karakter
const templateConfig = { 
  x: 520,   // Digeser agak ke kiri agar pas di tengah banner antara bendera dan logo rank
  y: 812,   // Dinaikkan ke posisi banner bawah (bukan melayang di atas)
  size: 40  // Ukuran font diperkecil agar pas dengan tinggi banner nama asli FF tersebut
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

    const { data } = await axios.get(TEMPLATE_IMAGE_URL, {
      responseType: "arraybuffer"
    });

    const image = await loadImage(Buffer.from(data));

    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, 0, 0, image.width, image.height);

    let fontSize = templateConfig.size;

    // Auto-scaling jika nama terlalu panjang agar tetap muat di dalam kotak banner
    if (name.length > 8) fontSize *= 0.9;
    if (name.length > 12) fontSize *= 0.8;
    if (name.length > 16) fontSize *= 0.7;

    ctx.font = `${Math.floor(fontSize)}px TeutonNormal`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Warna kuning emas khas Free Fire dengan stroke hitam tipis yang proporsional
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#FFD700";

    ctx.lineWidth = Math.max(2, Math.floor(fontSize / 15));

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