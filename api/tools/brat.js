const express = require('express');
const router = express.Router();
const { createCanvas, registerFont } = require('skia-canvas');
const Jimp = require("jimp");

// Fungsi BratGenerator ASLI (Tidak ada tanda/rumus yang diubah)
async function BratGenerator(teks) {
  let width = 512;
  let height = 512;
  let margin = 20;
  let wordSpacing = 50;
  let canvas = createCanvas(width, height);
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);
  let fontSize = 280;
  let lineHeightMultiplier = 1.3;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "black";
  registerFont("./font/arialnarrow.ttf", {
    family: "Narrow"
  });
  let words = teks.split(" ");
  let lines = [];
  let rebuildLines = () => {
    lines = [];
    let currentLine = "";
    for (let word of words) {
      let testLine = currentLine ? `${currentLine} ${word}` : word;
      let lineWidth = ctx.measureText(testLine).width + (currentLine.split(" ").length - 1) * wordSpacing;
      if (lineWidth < width - margin * 2) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  };
  ctx.font = `${fontSize}px Narrow`;
  rebuildLines();
  while (lines.length * fontSize * lineHeightMultiplier > height - margin * 2) {
    fontSize -= 2;
    ctx.font = `${fontSize}px Narrow`;
    rebuildLines();
  }
  let lineHeight = fontSize * lineHeightMultiplier;
  let y = margin;
  for (let line of lines) {
    let wordsInLine = line.split(" ");
    let x = margin;
    for (let word of wordsInLine) {
      ctx.fillText(word, x, y);
      x += ctx.measureText(word).width + wordSpacing;
    }
    y += lineHeight;
  }
  let buffer = canvas.toBuffer("image/png");
  let image = await Jimp.read(buffer); // Ditambahkan await agar Jimp menyelesaikan pembacaan buffer
  
  // Mengembalikan buffer gambar PNG asli dari Jimp
  return await image.getBufferAsync(Jimp.MIME_PNG);
}

// Endpoint API Brat
router.get('/', async (req, res) => {
  try {
    // Mengambil parameter text dari query URL (?text=...)
    const teks = req.query.text;

    if (!teks) {
      return res.status(400).json({ 
        status: false, 
        message: "Parameter 'text' tidak boleh kosong!" 
      });
    }

    // Memproses teks menggunakan fungsi BratGenerator
    const imageBuffer = await BratGenerator(teks);

    // Mengirimkan response langsung berupa gambar PNG
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length
    });
    res.end(imageBuffer);

  } catch (error) {
    console.error("Brat API Error:", error);
    return res.status(500).json({ 
      status: false, 
      error: error.message 
    });
  }
});

module.exports = router;
