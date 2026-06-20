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
  "https://files.soonex.biz.id/upload/53053f994d09.jpg";

const TEUTON_URL =
  "https://raw.githubusercontent.com/arulzzzxd/database/main/font/TeutonNormal.otf";

let fontsLoaded = false;

async function loadFonts() {
  if (fontsLoaded) return;

  try {
    const { data } = await axios.get(TEUTON_URL, {
      responseType: "arraybuffer",
      timeout: 15000
    });

    GlobalFonts.register(
      Buffer.from(data),
      "Teuton"
    );

    fontsLoaded = true;
  } catch (err) {
    console.error("Font Error:", err);
    throw err;
  }
}

router.get("/", async (req, res) => {
  try {
    const username = req.query.username || "Player";

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

    ctx.fillStyle = "#FFFFFF";
    ctx.textBaseline = "middle";
    ctx.font = "31px Teuton";

    ctx.fillText(
      username,
      267.8,
      1019
    );

    const png = await sharp(
      canvas.toBuffer("image/png")
    )
      .png()
      .toBuffer();

    res.setHeader(
      "Content-Type",
      "image/png"
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