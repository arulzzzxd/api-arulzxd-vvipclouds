const express = require("express");
const fs = require('fs');
const path = require("path");
const axios = require("axios");
const { exec } = require('child_process');
// Menggunakan @napi-rs/canvas
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');

const router = express.Router();

// ==========================================
// CORE FUNCTIONS (MENGGUNAKAN @NAPI-RS/CANVAS)
// ==========================================

async function create_frame(text, color, pathna) {
  const width = 400, height = 400;
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
  return canvas.toBuffer('image/png');
}

async function generateAttp(text) {
  const lokasina = path.join(__dirname, 'temp_frames');
  if (!fs.existsSync(lokasina)) fs.mkdirSync(lokasina);
  const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
  const fpaths = [];
  for (let i = 0; i < colors.length; i++) {
    const fpath = path.join(lokasina, `frame_${i}.png`);
    const buf = await create_frame(text, colors[i], fpath);
    fs.writeFileSync(fpath, buf);
    fpaths.push(fpath);
  }
  return new Promise((resolve, reject) => {
    const output_gif = path.join(__dirname, 'attp.gif');
    const ffmpeg_cmd = `ffmpeg -y -framerate 10 -i ${lokasina}/frame_%d.png -vf "scale=400:400:flags=lanczos" ${output_gif}`;
    exec(ffmpeg_cmd, (error) => {
      fpaths.forEach((file) => { if(fs.existsSync(file)) fs.unlinkSync(file); });
      if(fs.existsSync(lokasina)) fs.rmdirSync(lokasina);
      if (error) return reject(error);
      const buffna = fs.readFileSync(output_gif);
      fs.unlinkSync(output_gif);
      resolve(buffna);
    });
  });
}

async function generateTtp(text) {
  const width = 400, height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);

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

async function create_frame_v2(text, color, pathna) {
  const width = 400, height = 400;
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
  fs.writeFileSync(pathna, canvas.toBuffer('image/png'));
}

async function generateAttp_v2(text) {
  const lokasina = path.join(__dirname, 'temp_frames_v2');
  if (!fs.existsSync(lokasina)) fs.mkdirSync(lokasina);
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#F1C40F', '#8E44AD'];
  const fpaths = [];
  for (let i = 0; i < colors.length; i++) {
    const fpath = path.join(lokasina, `frame_${i}.png`);
    await create_frame_v2(text, colors[i], fpath);
    fpaths.push(fpath);
  }
  return new Promise((resolve, reject) => {
    const output_gif = path.join(__dirname, 'attp_v2.gif');
    const ffmpeg_cmd = `ffmpeg -y -framerate 12 -i ${lokasina}/frame_%d.png -vf "scale=400:400:flags=lanczos" ${output_gif}`;
    exec(ffmpeg_cmd, (error) => {
      fpaths.forEach((file) => { if(fs.existsSync(file)) fs.unlinkSync(file); });
      if(fs.existsSync(lokasina)) fs.rmdirSync(lokasina);
      if (error) return reject(error);
      const buffna = fs.readFileSync(output_gif);
      fs.unlinkSync(output_gif);
      resolve(buffna);
    });
  });
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

async function create_frame_v3(text, color, pathna) {
  const width = 400, height = 400;
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
  fs.writeFileSync(pathna, canvas.toBuffer('image/png'));
}

async function generateAttp_v3(text) {
  const lokasina = path.join(__dirname, 'temp_frames_v3');
  if (!fs.existsSync(lokasina)) fs.mkdirSync(lokasina);
  const colors = ['#FF4500', '#32CD32', '#1E90FF', '#FFD700', '#FF1493', '#00CED1'];
  const fpaths = [];
  for (let i = 0; i < colors.length; i++) {
    const fpath = path.join(lokasina, `frame_${i}.png`);
    await create_frame_v3(text, colors[i], fpath);
    fpaths.push(fpath);
  }
  return new Promise((resolve, reject) => {
    const output_gif = path.join(__dirname, 'attp_v3.gif');
    const ffmpeg_cmd = `ffmpeg -y -framerate 15 -i ${lokasina}/frame_%d.png -vf "scale=400:400:flags=lanczos" ${output_gif}`;
    exec(ffmpeg_cmd, (error) => {
      fpaths.forEach((file) => { if(fs.existsSync(file)) fs.unlinkSync(file); });
      if(fs.existsSync(lokasina)) fs.rmdirSync(lokasina);
      if (error) return reject(error);
      const buffna = fs.readFileSync(output_gif);
      fs.unlinkSync(output_gif);
      resolve(buffna);
    });
  });
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

async function create_frame_v4(text, color, pathna, frameIndex) {
  const width = 400, height = 400;
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
  fs.writeFileSync(pathna, canvas.toBuffer('image/png'));
}

async function generateAttp_v4(text) {
  const lokasina = path.join(__dirname, 'temp_frames_v4');
  if (!fs.existsSync(lokasina)) fs.mkdirSync(lokasina);
  const colors = ['#FF6347', '#40E0D0', '#9370DB', '#FFD700', '#00FF7F', '#FF69B4'];
  const fpaths = [];
  for (let i = 0; i < colors.length; i++) {
    const fpath = path.join(lokasina, `frame_${i}.png`);
    await create_frame_v4(text, colors[i], fpath, i);
    fpaths.push(fpath);
  }
  return new Promise((resolve, reject) => {
    const output_gif = path.join(__dirname, 'attp_v4.gif');
    const ffmpeg_cmd = `ffmpeg -y -framerate 20 -i ${lokasina}/frame_%d.png -vf "scale=400:400:flags=lanczos" ${output_gif}`;
    exec(ffmpeg_cmd, (error) => {
      fpaths.forEach((file) => { if(fs.existsSync(file)) fs.unlinkSync(file); });
      if(fs.existsSync(lokasina)) fs.rmdirSync(lokasina);
      if (error) return reject(error);
      const buffna = fs.readFileSync(output_gif);
      fs.unlinkSync(output_gif);
      resolve(buffna);
    });
  });
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
    const font_path = path.join(__dirname, 'lib', 'Baloo-Bold.ttf');
    const font_url = 'https://files.catbox.moe/abepcw.ttf';

    const dl_font = async () => {
        if (!fs.existsSync(font_path)) {
            const response = await axios.get(font_url, { responseType: 'arraybuffer' });
            fs.mkdirSync(path.join(__dirname, 'lib'), { recursive: true });
            fs.writeFileSync(font_path, Buffer.from(response.data));
        }
    };

    await dl_font();
    
    GlobalFonts.registerFromPath(font_path, 'Baloo');

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

    const buffer = canvas.toBuffer('image/png');
    return buffer;
}

// ==========================================
// EXPRESS ROUTER ENDPOINT (HTML REMOVED)
// ==========================================

router.get("/", async (req, res) => {
  try {
    const text = req.query.text;
    const type = req.query.type || 'ttp';

    // Jika parameter text kosong, berikan response bad request JSON
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
      case 'ttpv2':
        buffer = await generateTtp_v2(text);
        break;
      case 'attpv2':
        buffer = await generateAttp_v2(text);
        contentType = "image/gif";
        break;
      case 'ttpv3':
        buffer = await generateTtp_v3(text);
        break;
      case 'attpv3':
        buffer = await generateAttp_v3(text);
        contentType = "image/gif";
        break;
      case 'ttpv4':
        buffer = await generateTtp_v4(text);
        break;
      case 'attpv4':
        buffer = await generateAttp_v4(text);
        contentType = "image/gif";
        break;
      case 'ttpv5':
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
    // Menangani error dan mengirimkan status 500 (Internal Server Error) secara konsisten
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