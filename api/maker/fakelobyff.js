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

async function loadFont() {
  if (fontLoaded) return;

  const { data } = await axios.get(FONT_URL, {
    responseType: "arraybuffer"
  });

  GlobalFonts.register(Buffer.from(data), "TeutonNormal");
  fontLoaded = true;
}

router.get("/", async (req, res) => {
  try {
    const { template, name } = req.query;

    if (!template || !name) {
      return res.status(400).json({
        status: false,
        message: "Parameter template dan name wajib diisi"
      });
    }

    const imageUrl = imageUrls[template];

    if (!imageUrl) {
      return res.status(404).json({
        status: false,
        message: "Template tidak ditemukan"
      });
    }

    await loadFont();

    const bg = await axios.get(imageUrl, {
      responseType: "arraybuffer"
    });

    const image = await loadImage(Buffer.from(bg.data));

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

    const len = name.length;

    let size = 110;

    if (len > 8) size = 90;
    if (len > 12) size = 75;
    if (len > 18) size = 60;

    ctx.font = `${size}px TeutonNormal`;
    ctx.fillStyle = "#FFD700";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 6;

    const textWidth = ctx.measureText(name).width;

    const x =
      image.width / 2 -
      textWidth / 2 +
      image.width * 0.02;

    const y = image.height * 0.8;

    ctx.strokeText(name, x, y);
    ctx.fillText(name, x, y);

    const buffer = await canvas.encode("jpeg");

    res.setHeader("Content-Type", "image/jpeg");
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