const express = require("express");
const sharp = require("sharp");
const axios = require("axios");

const router = express.Router();

const TEMPLATE =
  "https://files.soonex.biz.id/upload/53053f994d09.jpg";

router.get("/", async (req, res) => {
  try {
    const username = req.query.username;

    const { data } = await axios.get(
      TEMPLATE,
      {
        responseType: "arraybuffer"
      }
    );

    const svg = `
      <svg width="736" height="1309">
        <text
          x="321.8"
          y="1024"
          font-size="30"
          fill="#ffffff"
          font-family="Arial,sans-serif"
          font-weight="bold"
        >
          ${username}
        </text>
      </svg>
    `;

    const buffer = await sharp(
      Buffer.from(data)
    )
      .composite([
        {
          input: Buffer.from(svg)
        }
      ])
      .png()
      .toBuffer();

    res.setHeader(
      "Content-Type",
      "image/png"
    );

    res.send(buffer);

  } catch (e) {
    res.status(500).json({
      status: false,
      error: e.message
    });
  }
});

module.exports = router;