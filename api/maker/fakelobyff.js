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

const templateConfig = {
  1:  { x: 627, y: 1045, size: 100 },
  2:  { x: 620, y: 1035, size: 95 },
  3:  { x: 625, y: 1040, size: 100 },
  4:  { x: 625, y: 1048, size: 100 },
  5:  { x: 627, y: 1055, size: 100 },
  6:  { x: 627, y: 1052, size: 100 },
  7:  { x: 405, y: 905, size: 50 },
  8:  { x: 625, y: 1045, size: 100 },
  9:  { x: 625, y: 1045, size: 100 },
  10: { x: 625, y: 1045, size: 100 },
  11: { x: 625, y: 1045, size: 100 }
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

if (name.length > 10) fontSize *= 0.9;
if (name.length > 15) fontSize *= 0.8;
if (name.length > 20) fontSize *= 0.7;

ctx.font = `${Math.floor(fontSize)}px TeutonNormal`;

ctx.textAlign = "center";
ctx.textBaseline = "middle";

ctx.strokeStyle = "#000000";
ctx.fillStyle = "#FFD700";

ctx.lineWidth = Math.max(
  2,
  Math.floor(fontSize / 20)
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