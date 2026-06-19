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
  1: { x: 0.52, y: 0.805 },
  2: { x: 0.52, y: 0.805 },
  3: { x: 0.52, y: 0.805 },
  4: { x: 0.52, y: 0.812 },
  5: { x: 0.50, y: 0.835 },
  6: { x: 0.50, y: 0.825 },
  7: { x: 0.50, y: 0.825 },
  8: { x: 0.50, y: 0.815 },
  9: { x: 0.50, y: 0.805 },
  10: { x: 0.50, y: 0.805 },
  11: { x: 0.50, y: 0.805 }
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
        message: "Template tidak ditemukan"
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

    let fontSize = 110;

    if (name.length > 8) fontSize = 95;
    if (name.length > 12) fontSize = 80;
    if (name.length > 18) fontSize = 65;

    ctx.font = `${fontSize}px TeutonNormal`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#FFD700";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;

    const pos =
      templateConfig[template] ||
      templateConfig[1];

    const x = image.width * pos.x;
    const y = image.height * pos.y;

    ctx.strokeText(name, x, y);
    ctx.fillText(name, x, y);

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