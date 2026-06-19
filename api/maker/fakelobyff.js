const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');

const router = express.Router();

const FONT_URL =
  'https://raw.githubusercontent.com/arulzzzxd/database/main/font/TeutonNormal.otf';

const imageUrls = {
  1: 'https://cloud-fukushima.vercel.app/uploader/8fjhd6ftps.jpg',
  2: 'https://cloud-fukushima.vercel.app/uploader/oz8hb4ow75.jpg',
  3: 'https://cloud-fukushima.vercel.app/uploader/tvz1cie8df.jpg',
  4: 'https://cloud-fukushima.vercel.app/uploader/yo9sg4vmo3.jpg',
  5: 'https://files.catbox.moe/cuatgd.jpg',
  6: 'https://files.catbox.moe/kfl1lb.jpg',
  7: 'https://files.catbox.moe/8vyh2k.jpg',
  8: 'https://files.catbox.moe/jxzw2r.jpg',
  9: 'https://files.catbox.moe/mmgua4.jpg',
  10: 'https://files.catbox.moe/rcgn6z.jpg',
  11: 'https://files.catbox.moe/v2np8h.jpg'
};

const TOTAL = Object.keys(imageUrls).length;

async function getFont() {
  const fontPath = path.join(os.tmpdir(), 'TeutonNormal.otf');

  if (!fs.existsSync(fontPath)) {
    const font = await axios.get(FONT_URL, {
      responseType: 'arraybuffer'
    });

    fs.writeFileSync(fontPath, font.data);
  }

  return fontPath;
}

router.get('/', async (req, res) => {
  const num = req.query.template;
  const name = req.query.name;

  if (!num || !name) {
    return res.status(400).json({
      status: false,
      message: "Format parameter salah.",
      example: "/api/maker/fakelobyff?template=5&name=Kyuu"
    });
  }

  const imageUrl = imageUrls[Number(num)];

  if (!imageUrl) {
    return res.status(404).json({
      status: false,
      message: `Template ${num} tidak tersedia. Pilih 1-${TOTAL}`
    });
  }

  const timestamp = Date.now();

  const tempImagePath = path.join(
    os.tmpdir(),
    `raw_${timestamp}.jpg`
  );

  const outputPath = path.join(
    os.tmpdir(),
    `fakeff_${timestamp}.jpg`
  );

  const cleanup = () => {
    try {
      if (fs.existsSync(tempImagePath))
        fs.unlinkSync(tempImagePath);

      if (fs.existsSync(outputPath))
        fs.unlinkSync(outputPath);
    } catch {}
  };

  try {
    const fontPath = await getFont();

    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });

    fs.writeFileSync(
      tempImagePath,
      Buffer.from(response.data)
    );

    const nameLen = name.length;

    const fontSize =
      nameLen <= 6
        ? 'w*0.055'
        : nameLen <= 10
        ? 'w*0.045'
        : 'w*0.035';

    const safeName = name
      .trim()
      .replace(/'/g, "\\'")
      .replace(/:/g, '\\:');

    const ffCmd = [
      'ffmpeg -y',
      `-i "${tempImagePath}"`,
      `-vf "drawtext=fontfile='${fontPath}':text='${safeName}':x=((w-text_w)/2)+(w*0.02):y=h*0.80-(text_h/2):fontsize=${fontSize}:fontcolor=yellow:shadowcolor=black:shadowx=3:shadowy=3"`,
      '-q:v 2',
      `"${outputPath}"`
    ].join(' ');

    await new Promise((resolve, reject) => {
      exec(ffCmd, (err, stdout, stderr) => {
        if (err) {
          return reject(
            new Error(stderr || err.message)
          );
        }

        resolve();
      });
    });

    const buffer = fs.readFileSync(outputPath);

    res.setHeader(
      'Content-Type',
      'image/jpeg'
    );

    res.setHeader(
      'Cache-Control',
      'public, max-age=86400'
    );

    res.send(buffer);

    cleanup();
  } catch (err) {
    cleanup();

    console.error(err);

    res.status(500).json({
      status: false,
      error: err.message,
      stack: err.stack
    });
  }
});

module.exports = router;