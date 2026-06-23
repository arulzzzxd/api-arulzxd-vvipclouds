const express = require("express");
const fs = require('fs');
const path = require("path");
const axios = require("axios");
const GIFEncoder = require('gifencoder'); // Menggantikan FFmpeg CLI
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');

const router = express.Router();

// Helper untuk membuat struktur gif di memory buffer tanpa simpan file disk
function createGifBuffer(width, height, delay, ctxts) {
  const encoder = new GIFEncoder(width, height);
  const stream = encoder.createReadStream();
  encoder.start();
  encoder.setRepeat(0);   // 0 = loop forever
  encoder.setDelay(delay);  // delay dalam ms
  encoder.setTransparent(0x00000000); // transparan jika diperlukan

  ctxts.forEach(ctx => {
    encoder.addFrame(ctx);
  });

  encoder.finish();

  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (err) => reject(err));
  });
}

// ==========================================
// CORE FUNCTIONS (MENGGUNAKAN MEMORY ONLY)
// ==========================================

function create_frame_context(text, color, width = 400, height = 400) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);

  let fsize = 80;
  if (text.length > 10) fsize = 60;
  if (text.length > 20) fsize = 40;

  ctx.font = `bold ${fsize}px Arial`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const words = text.split(' ');
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const test_line = line + word + ' ';
    const test_width = ctx.measureText(test_line).width;
    if (test_width > width - 40) {
      lines.push(line.trim());
      line = word + ' ';
    } else { line = test_line; }
  });
  lines.push(line.trim());

  const total_height = lines.length * fsize;
  let startY = (height - total_height) / 2 + fsize / 2;
  lines.forEach((line) => {
    ctx.fillText(line, width / 2, startY);
    startY += fsize;
  });
  return ctx;
}

async function generateAttp(text) {
  const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
  const contexts = colors.map(color => create_frame_context(text, color));
  // framerate 10 = delay 100ms
  return await createGifBuffer(400, 400, 100, contexts);
}

async function generateTtp(text) {
  const ctx = create_frame_context(text, 'white');
  return ctx.canvas.toBuffer('image/png');
}

function create_frame_v2_context(text, color, width = 400, height = 400) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'black');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  let fsize = 80;
  if (text.length > 10) fsize = 60;
  if (text.length > 20) fsize = 40;

  ctx.font = `bold ${fsize}px Arial`;
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const words = text.split(' ');
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const test_line = line + word + ' ';
    const test_width = ctx.measureText(test_line).width;
    if (test_width > width - 40) {
      lines.push(line.trim());
      line = word + ' ';
    } else { line = test_line; }
  });
  lines.push(line.trim());

  const total_height = lines.length * fsize;
  let startY = (height - total_height) / 2 + fsize / 2;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 10;
  lines.forEach((line) => {
    ctx.fillText(line, width / 2, startY);
    startY += fsize;
  });
  return ctx;
}

async function generateAttp_v2(text) {
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#F1C40F', '#8E44AD'];
  const contexts = colors.map(color => create_frame_v2_context(text, color));
  // framerate 12 = delay ~83ms
  return await createGifBuffer(400, 400, 83, contexts);
}

async function generateTtp_v2(text) {
  const width = 400, height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 200);
  gradient.addColorStop(0, '#FF5733');
  gradient.addColorStop(1, '#3357FF');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  let fsize = 80;
  if (text.length > 10) fsize = 60;
  if (text.length > 20) fsize = 40;

  ctx.font = `bold ${fsize}px Arial`;
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const words = text.split(' ');
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const test_line = line + word + ' ';
    const test_width = ctx.measureText(test_line).width;
    if (test_width > width - 40) {
      lines.push(line.trim());
      line = word + ' ';
    } else { line = test_line; }
  });
  lines.push(line.trim());

  const total_height = lines.length * fsize;
  let startY = (height - total_height) / 2 + fsize / 2;
  lines.forEach((line) => {
    ctx.fillText(line, width / 2, startY);
    startY += fsize;
  });
  return canvas.toBuffer('image/png');
}

function create_frame_v3_context(text, color, width = 400, height = 400) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  for (let x = 0; x < width; x += 40) {
    for (let y = 0; y < height; y += 40) {
      ctx.fillStyle = x % 80 === 0 ? color : '#222';
      ctx.fillRect(x, y, 40, 40);
    }
  }

  let fsize = 80;
  if (text.length > 10) fsize = 60;
  if (text.length > 20) fsize = 40;

  ctx.font = `bold ${fsize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const words = text.split(' ');
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const test_line = line + word + ' ';
    const test_width = ctx.measureText(test_line).width;
    if (test_width > width - 40) {
      lines.push(line.trim());
      line = word + ' ';
    } else { line = test_line; }
  });
  lines.push(line.trim());

  const total_height = lines.length * fsize;
  let startY = (height - total_height) / 2 + fsize / 2;
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'black';
  lines.forEach((line) => {
    ctx.strokeText(line, width / 2, startY);
    ctx.fillStyle = 'white';
    ctx.fillText(line, width / 2, startY);
    startY += fsize;
  });
  return ctx;
}

async function generateAttp_v3(text) {
  const colors = ['#FF4500', '#32CD32', '#1E90FF', '#FFD700', '#FF1493', '#00CED1'];
  const contexts = colors.map(color => create_frame_v3_context(text, color));
  // framerate 15 = delay ~66ms
  return await createGifBuffer(400, 400, 66, contexts);
}

async function generateTtp_v3(text) {
  const width = 400, height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  const gradient = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 200);
  gradient.addColorStop(0, '#FF00FF');
  gradient.addColorStop(1, '#000');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 200, 0, 2 * Math.PI);
  ctx.fill();

  let fsize = 80;
  if (text.length > 10) fsize = 60;
  if (text.length > 20) fsize = 40;

  ctx.font = `bold ${fsize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const words = text.split(' ');
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const testLine = line + word + ' ';
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > width - 40) {
      lines.push(line.trim());
      line = word + ' ';
    } else { line = testLine; }
  });
  lines.push(line.trim());

  const totalHeight = lines.length * fsize;
  let startY = (height - totalHeight) / 2 + fsize / 2;
  ctx.shadowColor = '#00FFFF';
  ctx.shadowBlur = 15;
  ctx.fillStyle = 'white';
  lines.forEach((line) => {
    ctx.fillText(line, width / 2, startY);
    startY += fsize;
  });
  return canvas.toBuffer('image/png');
}

function create_frame_v4_context(text, color, frameIndex, width = 400, height = 400) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, 200);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, '#000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 180 - frameIndex * 5, 0, 2 * Math.PI);
  ctx.strokeStyle = `rgba(255, 255, 255, 0.${10 - frameIndex})`;
  ctx.lineWidth = 8;
  ctx.stroke();

  let fsize = 80;
  if (text.length > 10) fsize = 60;
  if (text.length > 20) fsize = 40;

  ctx.font = `bold ${fsize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const words = text.split(' ');
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const testLine = line + word + ' ';
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > width - 40) {
      lines.push(line.trim());
      line = word + ' ';
    } else { line = testLine; }
  });
  lines.push(line.trim());

  const totalHeight = lines.length * fsize;
  let startY = (height - totalHeight) / 2 + fsize / 2;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  lines.forEach((line) => {
    ctx.fillText(line, width / 2 + 4, startY + 4);
    startY += fsize;
  });

  startY = (height - totalHeight) / 2 + fsize / 2;
  const textGradient = ctx.createLinearGradient(0, 0, width, 0);
  textGradient.addColorStop(0, '#FFFFFF');
  textGradient.addColorStop(1, color);
  ctx.fillStyle = textGradient;
  lines.forEach((line) => {
    ctx.fillText(line, width / 2, startY);
    startY += fsize;
  });
  return ctx;
}

async function generateAttp_v4(text) {
  const colors = ['#FF6347', '#40E0D0', '#9370DB', '#FFD700', '#00FF7F', '#FF69B4'];
  const contexts = colors.map((color, idx) => create_frame_v4_context(text, color, idx));
  // framerate 20 = delay 50ms
  return await createGifBuffer(400, 400, 50, contexts);
}

async function generateTtp_v4(text) {
  const width = 400, height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
    ctx.lineWidth = Math.random() * 3 + 1;
    ctx.stroke();
  }

  let fsize = 80;
  if (text.length > 10) fsize = 60;
  if (text.length > 20) fsize = 40;

  ctx.font = `bold ${fsize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const words = text.split(' ');
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const testLine = line + word + ' ';
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > width - 40) {
      lines.push(line.trim());
      line = word + ' ';
    } else { line = testLine; }
  });
  lines.push(line.trim());

  const totalHeight = lines.length * fsize;
  let startY = (height - totalHeight) / 2 + fsize / 2;
  ctx.shadowColor = '#FF4500';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#FFFFFF';
  lines.forEach((line) => {
    ctx.fillText(line, width / 2, startY);
    startY += fsize;
  });
  return canvas.toBuffer('image/png');
}

async function generateTtp_v5(text) {
    // Pada Vercel, kita gunakan folder sistem /tmp untuk write file font runtime jika belum ada
    const font_path = path.join('/tmp', 'Baloo-Bold.ttf');
    const font_url = 'https://files.catbox.moe/abepcw.ttf';

    if (!fs.existsSync(font_path)) {
        const response = await axios.get(font_url, { responseType: 'arraybuffer' });
        fs.writeFileSync(font_path, Buffer.from(response.data));
    }
    
    try {
      GlobalFonts.registerFromPath(font_path, 'Baloo');
    } catch(e) {}

    const width = 512, height = 512, maxWidth = 480;
    let fontSize = 100;
    let lineHeight = fontSize * 1.2;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ff9900';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const splitText = (txt, maxW) => {
        let words = txt.split(' ');
        let lines = [];
        let currentLine = '';
        for (const word of words) {
            let testLine = currentLine ? currentLine + ' ' + word : word;
            ctx.font = `${fontSize}px Baloo`;
            let testWidth = ctx.measureText(testLine).width;
            if (testWidth > maxW) {
                lines.push(currentLine);
                currentLine = word;
            } else { currentLine = testLine; }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
    };

    let lines = splitText(text, maxWidth);
    while (lines.length * lineHeight > height - 40) {
        fontSize -= 5;
        lineHeight = fontSize * 1.2;
        lines = splitText(text, maxWidth);
    }

    ctx.font = `${fontSize}px Baloo`;
    const textHeight = lines.length * lineHeight;
    const startY = (height - textHeight) / 2 + lineHeight / 2;

    lines.forEach((line, i) => {
        ctx.fillText(line, width / 2, startY + i * lineHeight);
    });

    return canvas.toBuffer('image/png');
}

// ==========================================
// EXPRESS ROUTER ENDPOINT (HTML DIBUANG)
// ==========================================

router.get("/", async (req, res) => {
  try {
    const text = req.query.text;
    const type = req.query.type || 'ttp';

    // Tanpa HTML, langsung lempar status 400 jika teks kosong
    if (!text) {
      return res.status(400).json({
        status: false,
        message: "Masukkan parameter 'text'. Contoh: ?text=Halo"
      });
    }

    let buffer;
    let contentType = "image/png";

    switch (type.toLowerCase()) {
      case 'ttp':
        buffer = await generateTtp(text);
        break;
      case 'attp':
        buffer = await generateAttp(text);
        contentType = "image/gif";
        break;
      case 'ttp_v2':
        buffer = await generateTtp_v2(text);
        break;
      case 'attp_v2':
        buffer = await generateAttp_v2(text);
        contentType = "image/gif";
        break;
      case 'ttp_v3':
        buffer = await generateTtp_v3(text);
        break;
      case 'attp_v3':
        buffer = await generateAttp_v3(text);
        contentType = "image/gif";
        break;
      case 'ttp_v4':
        buffer = await generateTtp_v4(text);
        break;
      case 'attp_v4':
        buffer = await generateAttp_v4(text);
        contentType = "image/gif";
        break;
      case 'ttp_v5':
        buffer = await generateTtp_v5(text);
        break;
      default:
        return res.status(400).json({
          status: false,
          message: `Tipe '${type}' tidak valid.`
        });
    }

    res.setHeader("Content-Type", contentType);
    return res.send(buffer);

  } catch (error) {
    return res.status(500).json({
      status: false,
      creator: "ArulzXD",
      error: error.message
    });
  }
});

router.status = "ready";
router.type = "free";
module.exports = router;
