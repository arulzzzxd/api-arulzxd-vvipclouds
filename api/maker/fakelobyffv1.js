const express = require("express");
const axios = require("axios");
const sharp = require("sharp");
const {
  createCanvas,
  loadImage,
  GlobalFonts
} = require("@napi-rs/canvas");

const router = express.Router();

const TEMPLATE =
  "https://files.soonex.biz.id/upload/f4065fc2ed8e.jpg";

const TEUTON_URL =
  "https://raw.githubusercontent.com/arulzzzxd/database/main/font/TeutonNormal.otf";

let fontsLoaded = false;

async function loadFonts() {
  if (fontsLoaded) return;

  const { data } = await axios.get(TEUTON_URL, {
    responseType: "arraybuffer",
    timeout: 15000
  });

  GlobalFonts.register(
    Buffer.from(data),
    "Teuton"
  );

  fontsLoaded = true;
}

router.get("/", async (req, res) => {
  try {
    const username = (req.query.username || "Player")
      .trim()
      .substring(0, 12);

    await loadFonts();

    const { data } = await axios.get(TEMPLATE, {
      responseType: "arraybuffer",
      timeout: 15000
    });

    const bg = await loadImage(Buffer.from(data));

    const canvas = createCanvas(
      bg.width,
      bg.height
    );

    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      bg,
      0,
      0,
      bg.width,
      bg.height
    );

    // ===== NICKNAME FF =====
    ctx.save();

    ctx.font = "30px Teuton";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const centerX = 317;
    const centerY = 1019;

    // Stroke hitam tipis
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    ctx.strokeText(
      username,
      centerX,
      centerY
    );

    // Teks putih
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(
      username,
      centerX,
      centerY
    );

    ctx.restore();

    const png = await sharp(
      canvas.toBuffer("image/png")
    )
      .png({
        compressionLevel: 9
      })
      .toBuffer();

    res.setHeader(
      "Content-Type",
      "image/png"
    );

    res.setHeader(
      "Cache-Control",
      "public, max-age=86400"
    );

    res.send(png);

  } catch (e) {
    console.error(e);

    res.status(500).json({
      status: false,
      error: e.message
    });
  }
});

module.exports = router;