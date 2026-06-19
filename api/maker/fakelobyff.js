const express = require("express");
const axios = require("axios");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");

const router = express.Router();

const FONT_URL =
"https://raw.githubusercontent.com/arulzzzxd/database/main/font/TeutonNormal.otf";

let fontLoaded = false;

const imageUrls = {
1: "https://cloud-fukushima.vercel.app/uploader/8fjhd6ftps.jpg",
2: "https://cloud-fukushima.vercel.app/uploader/oz8hb4ow75.jpg",
3: "https://cloud-fukushima.vercel.app/uploader/tvz1cie8df.jpg",
4: "https://cloud-fukushima.vercel.app/uploader/yo9sg4vmo3.jpg",
5: "https://files.catbox.moe/cuatgd.jpg",
6: "https://files.catbox.moe/kfl1lb.jpg",
7: "https://files.catbox.moe/8vyh2k.jpg",
8: "https://files.catbox.moe/jxzw2r.jpg",
9: "https://files.catbox.moe/mmgua4.jpg",
10: "https://files.catbox.moe/rcgn6z.jpg",
11: "https://files.catbox.moe/v2np8h.jpg"
};

// PERBAIKAN: Koordinat Y dikurangi agar posisi teks naik pas di dalam banner nama asli FF
const templateConfig = {
  1:  { x: 627, y: 1015, size: 85 },   // Menurunkan ukuran font sedikit & menaikkan Y agar pas di banner
  2:  { x: 620, y: 1005, size: 85 },   // Menaikkan posisi Y agar tidak menutupi tombol mic
  3:  { x: 625, y: 1010, size: 85 },
  4:  { x: 625, y: 1018, size: 85 },
  5:  { x: 627, y: 1025, size: 85 },
  6:  { x: 627, y: 1022, size: 85 },
  7:  { x: 395, y: 885, size: 45 },    // Penyesuaian posisi melayang untuk Template 7
  8:  { x: 625, y: 1015, size: 85 },
  9:  { x: 625, y: 1015, size: 85 },
  10: { x: 625, y: 1015, size: 85 },
  11: { x: 625, y: 1015, size: 85 }
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
const template = Number(
req.query.template || 1
);

const name = String(
  req.query.name || "ArulzXD"
);

const imageUrl = imageUrls[template];

if (!imageUrl) {
  return res.status(404).json({
    status: false,
    message: "Template tidak ditemukan",
    availableTemplates: Object.keys(imageUrls)
  });
}

await loadFont();

const { data } = await axios.get(
  imageUrl,
  {
    responseType: "arraybuffer"
  }
);

const image = await loadImage(
  Buffer.from(data)
);

const canvas = createCanvas(
  image.width,
  image.height
);

const ctx = canvas.getContext("2d");

ctx.drawImage(
  image,
  0,
  0,
  image.width,
  image.height
);

const cfg = templateConfig[template] || templateConfig[1];

let fontSize = cfg.size;

// Handle auto-scaling untuk nama yang panjang agar tidak keluar dari area banner
if (name.length > 8) fontSize *= 0.9;
if (name.length > 12) fontSize *= 0.8;
if (name.length > 16) fontSize *= 0.7;

ctx.font = `${Math.floor(fontSize)}px TeutonNormal`;

ctx.textAlign = "center";
ctx.textBaseline = "middle";

// Stroke (Garis tepi hitam) dibuat agak tebal agar terlihat mirip aslinya
ctx.strokeStyle = "#000000";
ctx.fillStyle = "#FFD700";

ctx.lineWidth = Math.max(
  4, // Menaikkan ketebalan minimal stroke hitam agar tulisan lebih tegas
  Math.floor(fontSize / 15)
);

ctx.strokeText(
  name,
  cfg.x,
  cfg.y
);

ctx.fillText(
  name,
  cfg.x,
  cfg.y
);

const buffer =
  await canvas.encode("jpeg");

res.setHeader(
  "Content-Type",
  "image/jpeg"
);

res.setHeader(
  "Cache-Control",
  "public, max-age=86400"
);

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