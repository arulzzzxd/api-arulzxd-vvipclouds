const express = require("express");
const sharp = require("sharp");
const axios = require("axios");

const router = express.Router();

const TEMPLATE =
  "https://files.soonex.biz.id/upload/53053f994d09.jpg";

const FONT_URL =
  "https://raw.githubusercontent.com/arulzzzxd/database/main/font/TeutonNormal.otf";

router.get("/", async (req, res) => {
  try {
    const username = req.query.username || "Player";

    const [{ data: bg }, { data: font }] = await Promise.all([
      axios.get(TEMPLATE, {
        responseType: "arraybuffer"
      }),
      axios.get(FONT_URL, {
        responseType: "arraybuffer"
      })
    ]);

    const fontBase64 = Buffer.from(font).toString("base64");

    const svg = `
      <svg width="736" height="1309">
        <defs>
          <style>
            @font-face {
              font-family: 'TeutonNormal';
              src: url(data:font/otf;base64,${fontBase64}) format('opentype');
            }

            .username {
              font-family: 'TeutonNormal';
              font-size: 30px;
              fill: #ffffff;
            }
          </style>
        </defs>

        <text
          x="321.8"
          y="1024"
          class="username"
        >
          ${username}
        </text>
      </svg>
    `;

    const buffer = await sharp(Buffer.from(bg))
      .composite([
        {
          input: Buffer.from(svg)
        }
      ])
      .png()
      .toBuffer();

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);

  } catch (e) {
    res.status(500).json({
      status: false,
      error: e.message
    });
  }
});

module.exports = router;