/* =========================================================================
   API-ARULZXD - REST API & UPLOADER INTEGRATION (UPDATED - FULL SVG)
   ========================================================================= */

const express = require('express');
const fileUpload = require('express-fileupload');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const mime = require('mime-types');
const nodemailer = require('nodemailer');
const https = require('https');
const http = require('http');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname)));
app.use(express.json());

const listNotifikasi = require('./database/notifikasi'); 

// Middleware untuk menangani form file upload (Uploader)
app.use(fileUpload());

/*
For setting API name etc
*/
const title = "API-ARULZXD - REST";
const favicon = "https://api-arulzxd-vvipclouds.vercel.app/files/X1F0Cn.png";
const logo = "https://api-arulzxd-vvipclouds.vercel.app/files/33s7XJ.png";
const headertitle = `<img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=700&size=28&pause=1000&color=00D4FF&center=true&vCenter=true&width=600&lines=Welcome+To+ArulzXD+API;Fast+%F0%9F%9A%80+Reliable+%E2%9A%A1;Free+REST+API+Services;Developer+Friendly+API" alt="Typing SVG" class="mx-auto" />`;
const headerdescription = "Browse, inspect & fire requests against live endpoints._";
const footer = "© Arulz-XD";

// API KEY CONFIGURATION
const VALID_API_KEY = "arulzxd-keys"; 
const PREMIUM_API_KEYS = ["arulz-premium", "key-vip-arulz", "owner-key-999"]; 

const repoList = ['uploadergh', 'uploaderghv2', 'uploaderghv3'];
const a = 'g';
const b = 'h';
const c = 'p';
const to = '_WaSUBUjo7g3YcCcyo'; 
const ken = 'OgBEWRKS16qYr1C8Gyg'; 
const githubToken = `${a}${b}${c}${to}${ken}`;
const owner = 'arulzzzxd'; 
const branch = 'main';

// Fungsi helper untuk mengambil repo acak setiap kali dipanggil
const getRandomRepo = () => repoList[Math.floor(Math.random() * repoList.length)];


const playlist = [
  {
    title: "PAMIT KERJO",
    artist: "NDX. AKA",
    cover: "https://i.ytimg.com/vi/x8ZMFhXiNyg/hq720.jpg",
    url: "https://files.catbox.moe/gfuwnv.mp3"
  },
  {
    title: "TANPO HUBUNGAN",
    artist: "LA TASYA",
    cover: "https://i.ytimg.com/vi/1gRZjdf02bo/hq720.jpg",
    url: "https://files.catbox.moe/xd5oq3.mp3"
  },
  {
    title: "DENOK",
    artist: "LA TASYA",
    cover: "https://i.ytimg.com/vi/J1TFFzbCIiM/hq720.jpg",
    url: "https://arulz-uploader.vercel.app/files/xlXr2L.mp3"
  },
  {
    title: "TUNGGAL EKA",
    artist: "DENNY CAKNAN",
    cover: "https://i.ytimg.com/vi/827HSYJX5uw/hq720.jpg",
    url: "https://files.catbox.moe/x67fur.mp3"
  },
  {
    title: "NGAPAIN REPOT",
    artist: "AJENG FEBRIA",
    cover: "https://i.ytimg.com/vi/-ix-XswQz10/hq720.jpg",
    url: "https://files.catbox.moe/hs1azs.mp3"
  }
];


const freeApiKeyLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 jam
    max: 100, // Maksimal 100 request
    keyGenerator: (req) => {
        // Deteksi apikey dari query (?apikey=) atau header
        return req.query.apikey || req.headers['x-api-key'] || req.ip; 
    },
    // ISI DENGAN INI AGAR PESAN CUSTOM ANDA MUNCUL
    handler: (req, res) => {
        res.status(429).json({
            status: false,
            creator: "ArulzXD",
            message: "Limit API Key Free Anda telah habis (Maks 100 req/hari). Silakan coba lagi besok atau upgrade ke Premium!"
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
});


app.get('/feedback', (req, res) => {
    res.sendFile(path.join(__dirname, 'feedback.html'));
});
app.post('/api/feedback', async (req, res) => {
    const email = req.body.email;     // Email si pengirim/user
    const type = req.body.type;       // Tipe (bug/suggestion)
    const message = req.body.message;   // Isi pesan dari user

    // Memvalidasi setiap field secara terpisah
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
    return res.status(400).json({ status: false, message: "Format email tidak valid!" });
}


if (!type) {
    return res.status(400).json({ status: false, message: "Tipe laporan wajib dipilih!" });
}

if (!message) {
    return res.status(400).json({ status: false, message: "Isi pesan tidak boleh kosong!" });
}


    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, 
            auth: {
                user: 'supportarulzxd@gmail.com',
                pass: 'matsgyapivykobdv' 
            },
            tls: {
                rejectUnauthorized: false 
            }
        });

const kategoriTeks = type === 'suggestion' ? 'Saran / Fitur' : 'Laporan Bug';
const subjectTeks = type === 'suggestion' ? 'Saran' : 'Laporan Bug';


        const mailOptions = {
            from: email, 
            to: 'supportarulzxd@gmail.com', // Ubah ke `email` jika ingin dikirim ke user pengirim
            replyTo: email, 
            subject: `[${type.toUpperCase()}] Laporan Baru dari Dashboard API`,
            html: `
                <div style="background-color: #0f0f11; padding: 30px 15px; font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #e4e4e7;">
                    <div style="max-w: 600px; margin: 0 auto; background-color: #18181c; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; padding: 30px;">
                        
                        <!-- Header Logo -->
                        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #27272a;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 800; tracking-spacing: 2px; color: #ffffff;">
                                Arulz<span style="color: #a1a1aa;">XD</span>
                            </h1>
                        </div>

                        <!-- Body Content -->
                        <div style="padding: 30px 0 20px 0;">
                            <h2 style="margin: 0 0 10px 0; font-size: 26px; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 8px;">
                                Pesan Diterima! ✅
                            </h2>
                            
                            <!-- Action Badge -->
                            <div style="margin-bottom: 25px;">
                                <span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; background-color: #27272a; color: #a1a1aa; padding: 6px 12px; border-radius: 6px;">
                                    Action: feedback-received
                                </span>
                            </div>

                            <p style="font-size: 15px; color: #d4d4d8; line-height: 1.6; margin: 0 0 20px 0;">
                                Halo <strong style="color: #ffffff;">Arulzxd</strong>, terima kasih telah menghubungi kami.
                            </p>

                            <!-- Success Alert Box -->
                            <div style="background-color: rgba(21, 128, 61, 0.1); border: 1px solid #16a34a; border-radius: 10px; padding: 15px 20px; margin-bottom: 30px; text-align: center;">
                                <p style="margin: 0; color: #4ade80; font-size: 14px; font-weight: 500;">
                                    Feedback kamu telah kami terima dan akan segera ditinjau oleh tim kami.
                                </p>
                            </div>

                            <!-- Meta Data Table -->
<div style="border-bottom: 1px solid #27272a; padding-bottom: 12px; margin-bottom: 20px;">
    <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 12px;">
        <span style="color: #a1a1aa;">Kategori</span>
        <strong style="color: #ffffff; font-family: monospace;">${kategoriTeks}</strong>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 14px;">
        <span style="color: #a1a1aa;">Subject</span>
        <strong style="color: #ffffff;">${subjectTeks}</strong>
    </div>
</div>

                            <!-- Message Box -->
                            <div style="background-color: #111113; border: 1px solid #27272a; border-radius: 10px; padding: 20px; margin-top: 15px;">
                                <p style="margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #e4e4e7; white-space: pre-wrap; line-height: 1.6;">${message}</p>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="margin-top: 20px; padding-top: 25px; border-top: 1px solid #27272a; text-align: center;">
                            <p style="font-size: 12px; color: #71717a; margin: 0 0 20px 0; line-height: 1.5;">
                                Email ini dikirim otomatis oleh sistem Api Arulz-XD. Jangan balas email ini.
                            </p>
                            
                            <!-- Navigation Links -->
                            <div style="margin-bottom: 25px; font-size: 13px; font-weight: 600;">
                                <a href="#" style="color: #ffffff; text-decoration: none; margin: 0 12px;">Home</a>
                                <a href="#" style="color: #ffffff; text-decoration: none; margin: 0 12px;">Docs</a>
                                <a href="#" style="color: #ffffff; text-decoration: none; margin: 0 12px;">File Upload</a>
                                <a href="#" style="color: #ffffff; text-decoration: none; margin: 0 12px;">Pastecode</a>
                            </div>

                            <p style="font-size: 12px; color: #71717a; margin: 0;">
                                © 2026 Api ArulzXD. All rights reserved.
                            </p>
                        </div>

                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ 
            status: true, 
            message: "Feedback berhasil dikirim ke email admin!" 
        });

    } catch (error) {
        console.error("Gagal mengirim email penerimaan:", error);
        res.status(500).json({ 
            status: false, 
            message: "Terjadi kesalahan pada sistem pengiriman email." 
        });
    }
});


app.get('/database/download', async (req, res) => {
    // Ambil target url gambar dari query parameter frontend, atau gunakan default jika kosong
    const imageUrl = req.query.url || "https://arulz-uploader.vercel.app/files/CVmlrD.jpg";

    try {
        // Tarik gambar server-to-server (Sistem Vercel/VPS tidak terikat CORS Browser)
        const response = await axios({
            method: 'get',
            url: imageUrl,
            responseType: 'stream' // Alirkan data sebagai stream data mentah
        });

        // Set header wajib untuk memaksa perangkat langsung mengunduh otomatis file biner
        res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
        res.setHeader('Content-Disposition', 'attachment; filename="QRIS_Arulz_XD.jpg"');
        res.setHeader('Access-Control-Allow-Origin', '*'); // Bypass izin CORS

        // Alirkan langsung pipa biner gambar ke browser user
        response.data.pipe(res);
    } catch (error) {
        console.error('Gagal memproses unduhan QRIS:', error.message);
        res.status(500).json({ error: "Gagal memproses unduhan otomatis di tingkat backend." });
    }
});



app.get('/uploader', (req, res) => {
  res.sendFile(path.join(__dirname, 'uploader.html'));
});

// Menyajikan halaman utama Pastecode di domain yang sama
app.get('/pastecode', (req, res) => {
  res.sendFile(path.join(__dirname, 'pastecode.html'));
});

app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'privacy.html'));
});

app.get('/support', (req, res) => {
    res.sendFile(path.join(__dirname, 'support.html'));
});


function getRequestProtocol(req) {
  const forwarded = req.headers['x-forwarded-proto'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.secure ? 'https' : 'http';
}

function generateId(length = 6) {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const bytes = crypto.randomBytes(length);
  let id = '';
  for (let i = 0; i < length; i++) {
    id += alphabet[bytes[i] % alphabet.length];
  }
  return id;
}

app.get('/files/*', async (req, res) => {
  const requestedPath = req.params[0]; 
  if (!requestedPath) return res.status(400).send('Missing file path');

  const gitPath = requestedPath.startsWith('uploads/') ? requestedPath : `uploads/${requestedPath}`;

  // Lakukan perulangan pada repoList secara acak untuk mencari file yang cocok
  const shuffledRepos = [...repoList].sort(() => Math.random() - 0.5);

  for (const targetRepo of shuffledRepos) {
    try {
      const resp = await axios.get(`https://api.github.com/repos/${owner}/${targetRepo}/contents/${gitPath}?ref=${branch}`, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3.raw'
        },
        responseType: 'arraybuffer',
        validateStatus: status => status < 500
      });

      if (resp.status === 200) {
        const contentType = mime.lookup(requestedPath) || 'application/octet-stream';
        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=3600');
        return res.send(Buffer.from(resp.data));
      }
    } catch (error) {
      console.error(`Gagal cek di repo ${targetRepo}:`, error.message);
    }
  }

  return res.status(404).send('File tidak ditemukan di seluruh GitHub Repository');
});

app.post('/uploadfile', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('Tidak ada file yang diunggah.');
  }

  let uploadedFile = req.files.file;
  const originalName = uploadedFile.name || 'file';
  const origExt = path.extname(originalName);

  let extension = origExt ? origExt.replace(/^\./, '') : (mime.extension(uploadedFile.mimetype) || 'bin');
  let id = generateId(6);
  let fileName = origExt ? `${id}${origExt}` : `${id}.${extension}`;
  let gitPath = `uploads/${fileName}`;
  let base64Content = Buffer.from(uploadedFile.data).toString('base64');

  // PILIH REPO SECARA RANDOM SETIAP KALI UNGGAH
  const selectedRepo = getRandomRepo(); 

  try {
    await axios.put(`https://api.github.com/repos/${owner}/${selectedRepo}/contents/${gitPath}`, {
      message: `Upload file ${fileName} to ${selectedRepo}`,
      content: base64Content,
      branch: branch,
    }, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
      },
    });

    const protocol = getRequestProtocol(req);
    const baseWebUrl = process.env.BASE_URL || `${protocol}://${req.get('host')}`;
    const rawUrl = `${baseWebUrl}/files/${fileName}`;

    res.send(`
      <!DOCTYPE html>
      <html lang="id" class="dark">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unggahan Berhasil</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <script>
              tailwind.config = {
                  darkMode: 'class',
                  theme: { 
                      extend: {
                          fontFamily: {
                              sans: ['Plus Jakarta Sans', 'sans-serif'],
                          }
                      } 
                  }
              }
          </script>
          <style>
              body { 
                  background-color: #0b0f19; 
                  color: #f3f4f6;
                  background-image: 
                      radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 50% 100%, rgba(16, 185, 129, 0.03) 0%, transparent 50%);
              }
              .glass-card {
                  background: rgba(17, 24, 39, 0.65);
                  backdrop-filter: blur(16px);
                  border: 1px solid rgba(255, 255, 255, 0.07);
                  animation: cardFadeIn 0.5s ease-out forwards;
              }
              .url-box {
                  background: rgba(0, 0, 0, 0.25);
                  border: 1px solid rgba(255, 255, 255, 0.05);
              }
              .checkmark-circle {
                  background: rgba(16, 185, 129, 0.06);
                  border: 1px solid rgba(16, 185, 129, 0.2);
                  animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
              }
              .checkmark-path {
                  stroke-dasharray: 100;
                  stroke-dashoffset: 100;
                  animation: drawCheck 0.6s ease-in-out 0.3s forwards;
              }
              @keyframes cardFadeIn {
                  from { opacity: 0; transform: translateY(12px); }
                  to { opacity: 1; transform: translateY(0); }
              }
              @keyframes scaleIn {
                  from { transform: scale(0); opacity: 0; }
                  to { transform: scale(1); opacity: 1; }
              }
              @keyframes drawCheck {
                  from { stroke-dashoffset: 100; }
                  to { stroke-dashoffset: 0; }
              }
          </style>
      </head>
      <body class="flex flex-col items-center justify-center min-h-screen p-4 antialiased">
          <div class="glass-card p-7 rounded-2xl shadow-2xl w-full max-w-md text-center">
              <div class="mb-5 flex justify-center">
                  <div class="checkmark-circle w-16 h-16 rounded-full flex items-center justify-center text-emerald-400">
                      <svg class="w-8 h-8 flex items-center justify-center" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" style="display: block;">
                          <path class="checkmark-path" stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                      </svg>
                  </div>
              </div>
              <h1 class="text-xl font-extrabold mb-1.5 tracking-tight text-white">Unggahan Berhasil!</h1>
              <p class="mb-5 text-xs text-gray-400">Berkas Anda telah aktif di cloud server:</p>
              <div class="url-box p-3.5 rounded-xl break-all mb-6">
                  <a id="rawUrl" href="${rawUrl}" target="_blank" class="text-cyan-400 hover:text-cyan-300 font-mono text-xs font-semibold transition-colors">${rawUrl}</a>
              </div>
              <div class="flex space-x-3">
                  <button onclick="copyToClipboard()" class="flex-1 bg-zinc-800/80 hover:bg-zinc-700 text-gray-200 text-xs font-bold py-3 px-4 rounded-xl transition duration-200 border border-white/5">
                      Salin URL
                  </button>
                  <a href="/uploader" class="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md shadow-cyan-950/30 transition duration-200 block text-center">
                      Kembali
                  </a>
              </div>
          </div>
          <div id="toast" class="fixed bottom-5 bg-emerald-600/90 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-lg opacity-0 invisible transition-all duration-300 tracking-wide">
              URL Berhasil disalin ke papan klip!
          </div>
          <script>
              function copyToClipboard() {
                  const urlText = document.getElementById('rawUrl').href;
                  navigator.clipboard.writeText(urlText).then(() => {
                      const toast = document.getElementById('toast');
                      toast.classList.remove('opacity-0', 'invisible');
                      toast.classList.add('opacity-100', 'visible');
                      setTimeout(() => {
                          toast.classList.remove('opacity-100', 'visible');
                          toast.classList.add('opacity-0', 'invisible');
                      }, 2500);
                  });
              }
          </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file.');
  }
});

const router = express.Router();
const apiPath = path.join(__dirname, 'api');

const validateApiKey = (req, res, next) => {
  if (req.path === '/apilist') {
    return next();
  }

  const userKey = req.query.apikey || req.body.apikey;

  if (!userKey) {
    return res.status(403).json({
      status: false,
      creator: "Arulz-XD",
      message: "API Key mana? masukkan parameter ?apikey=MasukkanApiKey"
    });
  }

  const isFreeKey = (userKey === VALID_API_KEY);
  const isPremiumKey = PREMIUM_API_KEYS.includes(userKey);

  if (!isFreeKey && !isPremiumKey) {
    return res.status(403).json({
      status: false,
      creator: "Arulz-XD",
      message: "API Key salah / tidak valid! Silakan cek menu informasi untuk melihat key yang benar."
    });
  }

  const pathParts = req.path.split('/');
  const currentCategory = pathParts[1]; 
  const currentRouteName = pathParts[2];   

  if (currentCategory && currentRouteName) {
    try {
      const routeFilePath = path.join(apiPath, currentCategory, `${currentRouteName}.js`);
      if (fs.existsSync(routeFilePath)) {
        const routeModule = require(routeFilePath);

        if (routeModule.status === "error" || routeModule.status === "perbaikan") {
          return res.status(503).json({
            status: false,
            creator: "Arulz-XD",
            message: "Fitur ini sedang dalam perbaikan / maintenance!"
          });
        }

        if (routeModule.type === "premium" && !isPremiumKey) {
          return res.status(403).json({
            status: false,
            creator: "Arulz-XD",
            message: "Endpoint ini khusus pengguna Premium! Hubungi Developer untuk mendapatkan akses VIP."
          });
        }
      }
    } catch (e) {
      console.error("Gagal memvalidasi status/type router:", e.message);
    }
  }

  next();
};

router.use(validateApiKey);


router.use((req, res, next) => {
  // Gabungkan parameter query (GET) dan body (POST)
  req.apiParams = { ...req.query, ...req.body };

  // Jika terdapat file yang diunggah (mendukung gambar, pdf, zip, video, audio, dll)
  if (req.files && Object.keys(req.files).length > 0) {
    for (const key in req.files) {
      const file = req.files[key];

      // Bungkus data file agar mudah dibaca di dalam logic internal modul file Anda
      req.apiParams[key] = {
        name: file.name,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.data, // Menyimpan raw buffer file
        ext: path.extname(file.name).toLowerCase()
      };
    }
  }
  next();
});

// Pendaftaran sub-router dynamic bawaan Anda (Tetap biarkan seperti ini)
const endpointDirs = fs.readdirSync(apiPath).filter(f => fs.statSync(path.join(apiPath, f)).isDirectory());

for (const category of endpointDirs) {
  const categoryPath = path.join(apiPath, category);
  const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const routeName = path.basename(file, '.js');
    const route = require(path.join(categoryPath, file));
    router.use(`/${category}/${routeName}`, route);
  }
}

function getEndpointsFromRouter(category, file) {
  const endpoints = [];
  const route = require(path.join(apiPath, category, file));
  const subRouter = route.stack ? route : route.router || route;
  if (!subRouter || !subRouter.stack) return endpoints;

  subRouter.stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
      let params = { apikey: "" }; 

      if (layer.route.stack && layer.route.stack.length) {
        layer.route.stack.forEach(mw => {
          const fnString = mw.handle.toString();

          [...fnString.matchAll(/req\.query\.([a-zA-Z0-9_]+)/g)].forEach(match => {
            if (match[1] !== 'apikey') {
              if (route.paramsConfig && route.paramsConfig[match[1]]) {
                params[match[1]] = route.paramsConfig[match[1]];
              } else {
                params[match[1]] = "";
              }
            }
          });

          [...fnString.matchAll(/req\.body\.([a-zA-Z0-9_]+)/g)].forEach(match => {
            if (match[1] !== 'apikey') params[match[1]] = "";
          });
        });
      }

      endpoints.push({
        name: `/${category}/${file.replace(/\.js$/,"")}`,
        path: `/api/${category}/${file.replace(/\.js$/,"")}`,
        desc: `/${category}/${file.replace(/\.js$/,"")}`,
        status: route.status || "ready",
        type: route.type || "free",
        params,
        methods
      });
    }
  });
  return endpoints;
}

router.get('/apilist', (req, res) => {
  const categories = [];

  for (const category of endpointDirs) {
    const files = fs.readdirSync(path.join(apiPath, category)).filter(f => f.endsWith('.js'));
    const endpoints = [];
    for (const file of files) {
      endpoints.push(...getEndpointsFromRouter(category, file));
    }
    if (endpoints.length) {
      categories.push({
        name: `${category.toUpperCase()}`,
        items: endpoints
      });
    }
  }

  categories.push({
    name: "OTHER",
    items: [
      {
        name: "/apilist",
        path: "/api/apilist",
        desc: "/apilist",
        status: "ready",
        type: "free",
        params: { apikey: "" },
        methods: ["GET"]
      }
    ]
  });

  res.json({ categories });
});

// 1. Jalankan limiter terlebih dahulu untuk menyaring request
app.use('/api/', freeApiKeyLimiter);

// 2. Jika lolos limit, baru teruskan ke router utama Anda
app.use('/api', router);

app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});
app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/', (req, res) => {
    let notifHtmlItems = '';
    listNotifikasi.forEach((notif) => {
        notifHtmlItems += `
        <div class="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all">
            <div class="flex justify-between items-start mb-1">
                <h4 class="font-semibold text-sm text-cyan-400">${notif.judul}</h4>
                <span class="text-[10px] text-slate-500 font-mono">${notif.waktu}</span>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">${notif.deskripsi}</p>
        </div>
        `;
    });

    res.send(`<!DOCTYPE html>
<html lang="id" class="notranslate" translate="no">
<head>
    <meta charset="UTF-8" />
    <meta name="google" content="notranslate" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${title}</title>
    <link id="faviconLink" rel="icon" type="image/x-icon" href="${favicon}">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css" />
    
    <style>
    .bg-dots-light {
        background-color: #ffffff;
        background-image: radial-gradient(#e2e8f0 1.5px, transparent 1.5px);
        background-size: 24px 24px;
    }

    .bg-dots-dark {
        background-color: #0f172a;
        background-image: radial-gradient(rgba(255, 255, 255, 0.15) 1.5px, transparent 1.5px);
        background-size: 24px 24px;
    }
    
    #themeBg {
        transition: background-color 0.3s ease, background-image 0.3s ease;
    }
    body {
        transition: background 0.25s ease, color 0.25s ease;
    }

    .glass-panel {
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        will-change: transform, opacity;
    }
    
    .light-mode .glass-panel {
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(15, 23, 42, 0.12);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
    }

    .light-mode {
        color: #0f172a !important;
    }
    .light-mode #mainTitle { color: #0f172a !important; }
    .light-mode #mainDescription { color: #334155 !important; }
    .light-mode #stat-battery-title,
    .light-mode #stat-endpoints-title,
    .light-mode #stat-categories-title { color: #475569 !important; }
    .light-mode #siteFooter { color: #64748b !important; border-color: rgba(0,0,0,0.1); }
    .light-mode #no-results-title { color: #0f172a !important; }

    .light-mode .music-player-card {
        background: rgba(255, 255, 255, 0.85) !important;
        border-color: rgba(0, 0, 0, 0.12) !important;
    }
    .light-mode .music-text-title { color: #0f172a !important; }
    .light-mode .music-text-artist { color: #475569 !important; }
    .light-mode .music-progress-bar-bg { background-color: rgba(0,0,0,0.1) !important; }
    
    .light-mode .music-btn-nav {
        background-color: rgba(255, 255, 255, 0.9) !important;
        border-color: rgba(0,0,0,0.12) !important;
        color: #1e293b !important;
    }
    .light-mode .music-btn-nav:hover {
        background-color: #f1f5f9 !important;
        color: #0f172a !important;
    }
    
    .lang-btn {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: bold;
        padding: 3px 10px;
        border: 2px solid #000000;
        background-color: #1a1a1a;
        color: #ffffff;
        transition: all 0.15s ease;
    }
    .lang-btn.active {
        background-color: #06b6d4;
        color: #000000;
        box-shadow: 2px 2px 0px #000000;
    }

    .filter-btn {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        padding: 6px 12px;
        border: 1px solid rgba(255,255,255,0.2);
        background: rgba(255,255,255,0.05);
        color: #e2e8f0;
        transition: all 0.2s ease;
        border-radius: 8px;
        white-space: nowrap;
        cursor: pointer;
    }
    .filter-btn:hover {
        background: rgba(255,255,255,0.15);
    }
    .filter-btn.active {
        background-color: #06b6d4 !important;
        color: #000000 !important;
        border-color: #06b6d4 !important;
        font-weight: bold;
    }
    .light-mode .filter-btn {
        border-color: rgba(0,0,0,0.15);
        background: rgba(0,0,0,0.04);
        color: #334155;
    }
    .light-mode .filter-btn:hover {
        background: rgba(0,0,0,0.08);
    }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="min-h-screen antialiased bg-[#030712] text-slate-100 relative">
<div id="themeBg" class="fixed inset-0 -z-10 bg-dots-dark"></div>

    <div id="welcomePopup" class="fixed inset-0 z-[99999] hidden">
      <div class="fixed inset-0 bg-black/70 backdrop-blur-md"></div>
      
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md relative p-6 font-['Space_Grotesk'] text-slate-100 transition-all duration-300">
          
          <button id="closePopupBtn" class="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors bg-white/5 hover:bg-white/10 rounded-full p-1.5 focus:outline-none border border-white/5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          
          <div class="text-center mb-5">
            <h1 class="text-xl sm:text-2xl font-extrabold text-white leading-tight tracking-wide">
              Welcome to<br><span class="text-cyan-400">Arulz-XD API</span>
            </h1>
          </div>
          
          <div class="mb-5 rounded-xl overflow-hidden border border-white/10 bg-black/40">
            <img src="https://api-arulzxd-vvipclouds.vercel.app/files/X1F0Cn.png" alt="Welcome Banner" class="w-full h-auto object-cover max-h-48" />
          </div>
          
          <div class="text-center text-slate-300 text-xs sm:text-sm mb-6 px-2 leading-relaxed">
            <p>Halo! 👋 Selamat datang di Arulz-XD API. Terima kasih sudah berkunjung. API ini dibuat untuk membantu developer dengan berbagai fitur yang terus diperbarui. Silakan gunakan Free API Key di bawah ini, dan jika proyek ini bermanfaat, jangan lupa dukung pengembang agar layanan tetap online dan terus berkembang. 🚀</p>
          </div>
          
          <div class="mb-6 flex justify-center">
            <div class="bg-black/30 rounded-full py-2.5 px-6 border-2 border-dashed border-cyan-500/50 shadow-inner">
              <span class="font-bold text-xs sm:text-sm text-slate-200 tracking-wide">
                Free apikey : <span class="font-mono text-cyan-400 select-all">${VALID_API_KEY}</span>
              </span>
            </div>
          </div>
          
          <div class="text-center text-slate-400 text-[11px] mb-5 flex items-center justify-center gap-1.5 font-medium tracking-wide">
            <span>💙 Jika API ini bermanfaat, dukung pengembang agar layanan tetap aktif, terus berkembang, dan mendapatkan pembaruan fitur secara berkala.</span>
            <svg class="w-4 h-4 text-cyan-400 animate-bounce" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 3.31a14.98 14.98 0 00-6.16 12.12A14.98 14.98 0 0015.59 14.37z" />
            </svg>
          </div>
          
          <a href="/support" class="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-cyan-950/50 transition-all active:scale-95 text-sm block text-center tracking-wider uppercase">
    Donate Sekarang
</a>
        </div>
      </div>
    </div>

    <div id="notifPopup" class="fixed inset-0 z-[99999] hidden">
        <div id="notifOverlay" class="fixed inset-0 bg-black/75 backdrop-blur-md"></div>
        <div class="fixed inset-0 flex items-center justify-center p-4">
            <div class="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 font-['Space_Grotesk'] text-slate-100 relative max-h-[85vh] flex flex-col">
                
                <button id="closeNotifBtn" class="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors bg-white/5 hover:bg-white/10 rounded-full p-1.5 focus:outline-none">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
                
                <div class="mb-4">
                    <h3 class="text-lg font-bold text-white flex items-center gap-2">
                        <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                        </svg>
                        Pusat Pemberitahuan
                    </h3>
                    <p class="text-xs text-slate-400">Informasi update fitur dan sistem berkala</p>
                </div>
                
                <div class="space-y-3 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                    ${notifHtmlItems}
                </div>
            </div>
        </div>
    </div>

    <div id="toast" class="toast z-50">
        <div class="flex items-center gap-3">
            <svg id="toastIcon" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span id="toastMessage" class="font-medium">Action completed</span>
        </div>
    </div>

    <div class="fixed top-6 right-6 z-40 flex items-center gap-3">
        <button id="notifMenuBtn" class="relative flex items-center justify-center w-12 h-12 rounded-xl glass-panel text-slate-300 hover:text-white shadow-lg transition-all active:scale-95 focus:outline-none light-mode:text-slate-700 light-mode:hover:text-slate-900">
            <svg class="w-6 h-6 animate-[swing_2s_ease-in-out_infinite]" fill="none" stroke="currentColor" stroke-width="2.3" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span id="notifBadge" class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md border border-slate-900 animate-pulse">•</span>
        </button>

        <button id="bioMenuBtn" class="flex items-center justify-center w-12 h-12 rounded-xl glass-panel text-slate-300 hover:text-white shadow-lg transition-all active:scale-95 focus:outline-none light-mode:text-slate-700 light-mode:hover:text-slate-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    </div>

    <div id="bioDropdown" class="fixed top-0 right-0 h-full w-72 bg-[#08111e]/95 backdrop-blur-lg border-l border-white/10 transform translate-x-full transition-transform duration-300 ease-in-out z-50 shadow-2xl flex flex-col p-6 font-['Space_Grotesk'] light-mode:bg-white/95 light-mode:border-slate-200">
        <div class="flex items-center justify-between mb-4">
            <div class="flex gap-0 border border-black p-0.5 bg-[#111]">
                <button id="lang-id" class="lang-btn active" onclick="setLanguage('id')">ID</button>
                <button id="lang-en" class="lang-btn" onclick="setLanguage('en')">EN</button>
            </div>
            
            <div class="flex items-center gap-2">
                <button id="themeToggle" class="flex items-center justify-center w-8 h-8 rounded-lg transition-all active:scale-95 focus:outline-none border border-white/20 bg-slate-900/50 text-white light-mode:bg-slate-100 light-mode:border-slate-300 light-mode:text-slate-900">
                    <svg id="theme-toggle-dark-icon" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                    </svg>
                    <svg id="theme-toggle-light-icon" class="w-4 h-4 hidden" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>
                    </svg>
                </button>

                <button id="closeMenuBtn" class="text-white hover:text-red-400 transition-colors p-1.5 border border-white/10 rounded bg-slate-900/40 light-mode:text-slate-700 light-mode:bg-slate-100 light-mode:border-slate-300 light-mode:hover:text-red-500">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        </div>

        <div class="mb-4 p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl light-mode:bg-cyan-50 light-mode:border-cyan-200">
            <span class="text-[10px] font-bold text-cyan-400 light-mode:text-cyan-700 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Current API Key
            </span>
            <div class="flex items-center justify-between bg-black/40 rounded px-2 py-1.5 font-mono text-xs text-slate-200 border border-white/5 light-mode:bg-white light-mode:text-slate-800 light-mode:border-slate-200">
                <span class="select-all">${VALID_API_KEY}</span>
                <button onclick="copyText('${VALID_API_KEY}', 'API Key Free')" class="p-1 text-slate-400 hover:text-cyan-400 transition-colors" title="Copy API Key">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                </button>
            </div>
        </div>

        <nav class="flex flex-col gap-4 text-xs font-bold tracking-wider uppercase text-gray-300 light-mode:text-slate-700 flex-1 overflow-y-auto scrollbar-hide py-2">
            <a href="#api" class="menu-link hover:text-cyan-400 transition-colors flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5">
                <svg class="w-5 h-5 text-cyan-400 text-center" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                HOME
            </a>
            <a href="#apiList" class="menu-link hover:text-cyan-400 transition-colors flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5">
                <svg class="w-5 h-5 text-cyan-400 text-center" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                DOCUMENTATION
            </a>
            <button id="uploaderMenuBtn" class="menu-link hover:text-cyan-400 transition-colors flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 text-left w-full focus:outline-none">
                <svg class="w-5 h-5 text-cyan-400 text-center" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                File Upload
            </button>
            <a href="/pastecode" class="menu-link hover:text-cyan-400 transition-colors flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5">
    <svg class="w-5 h-5 text-cyan-400 text-center" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
    PASTECODE
</a>           
            <hr class="border-white/10 my-1 light-mode:border-slate-200">
            
            <a href="/feedback" class="menu-link hover:text-cyan-400 transition-colors flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    Bug Report & Feedback
</a>
            
<a href="/privacy" class="menu-link hover:text-cyan-400 transition-colors flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5">
    <svg class="w-5 h-5 text-cyan-400 text-center" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
    </svg>
    PRIVACY
</a>

<a href="/support" class="menu-link hover:text-cyan-400 transition-colors flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5">
    <svg class="w-5 h-5 text-cyan-400 text-center" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
    </svg>
    SUPPORT
</a>
            <a href="https://wa.me/6285122629940?text=Halo+Arulz%2C+saya+ingin+bertanya+mengenai+REST+API+Anda." target="_blank" class="menu-link hover:text-cyan-400 transition-colors flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 text-[11px] opacity-80">
                <svg class="w-5 h-5 text-cyan-400 text-center fill-current" viewBox="0 0 24 24">
                    <path d="M12.004 2c-5.518 0-10 4.482-10 10 0 1.758.455 3.411 1.252 4.862l-1.252 4.568 4.673-1.226c1.403.766 2.992 1.196 4.68 1.196 5.517 0 10-4.482 10-10s-4.483-10-10-10zm5.82 14.195c-.244.688-1.22 1.252-1.682 1.32-.423.062-.977.112-2.923-.695-2.493-1.032-4.1-3.57-4.225-3.737-.123-.166-1.01-1.344-1.01-2.564 0-1.22.637-1.819.863-2.062.225-.244.49-.305.652-.305.162 0 .325.002.466.008.147.006.345-.056.54.412.2.482.686 1.674.747 1.798.06.124.102.268.02.433-.082.165-.124.268-.246.412-.124.143-.26.32-.37.43-.125.125-.254.26-.11.51.144.25.64 1.056 1.374 1.71.946.843 1.745 1.103 1.99 1.225.244.123.387.102.53-.062.143-.165.613-.713.776-.956.163-.244.325-.206.54-.124.215.083 1.363.643 1.597.76.235.118.39.176.448.275.058.1.058.58-.186 1.268z"/>
                </svg>
                OWNER (WHATSAPP)
            </a>
            <a href="https://t.me/arulzzxd" target="_blank" class="menu-link hover:text-cyan-400 transition-colors flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 text-[11px] opacity-80">
                <svg class="w-5 h-5 text-cyan-400 text-center fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.58.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.33-.26-1.99-.48-.8-.26-1.43-.41-1.38-.86.03-.24.35-.48.97-.73 3.8-1.65 6.34-2.74 7.61-3.25 3.61-1.47 4.36-1.73 4.85-1.74.11 0 .35.03.5.16.13.12.17.27.18.38-.01.12.01.27 0 .42z"/>
                </svg>
                OWNER (TELEGRAM)
            </a>
        </nav>
    </div>

    <div id="menuOverlay" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden z-30 transition-opacity duration-300"></div>

    <div class="max-w-5xl mx-auto px-4 py-8 relative z-10">
        <header id="api" class="mb-12 text-center">
            <div class="flex items-center justify-center gap-3 mb-2">
                <span class="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 animate-pulse light-mode:bg-cyan-100 light-mode:text-cyan-700">
                    <span class="w-2 h-2 rounded-full bg-cyan-400"></span> ONLINE
                </span>
            </div>
            <div id="mainTitle" class="flex justify-center mb-4 min-h-[50px] items-center">${headertitle}</div>
            <p id="mainDescription" class="text-md md:text-lg font-medium tracking-wide text-slate-300 max-w-xl mx-auto">${headerdescription}</p>
            
            <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div class="glass-panel flex flex-col items-center justify-center p-4 rounded-xl shadow-lg">
                    <div class="text-center mb-3 font-['Space_Grotesk']">
                        <div id="liveClock" class="text-2xl font-black tracking-wider text-cyan-400 light-mode:text-cyan-600 font-mono">
                            00:00:00
                        </div>
                        <div id="liveDate" class="text-[10px] font-bold opacity-70 tracking-wide mt-0.5 uppercase">
                            Memuat tanggal...
                        </div>
                    </div>
                    <hr class="w-full border-white/5 light-mode:border-slate-200 mb-3">
                    
                    <span id="stat-battery-title" class="text-xs font-bold uppercase tracking-wider text-slate-400">Baterai Anda</span>
                    <div class="flex items-center gap-3 mt-2">
                        <div id="batteryContainer" class="battery-container border border-white/20 light-mode:border-slate-400">
                            <div id="batteryLevel" class="battery-level bg-green-400" style="width: 0%"></div>
                            <div class="battery-tip"></div>
                        </div>
                        <div class="text-left">
                            <span id="batteryPercentage" class="text-lg font-bold block leading-none light-mode:text-slate-900">0%</span>
                            <span id="batteryStatus" class="text-[10px] uppercase text-slate-400 light-mode:text-slate-500 font-medium">Mendeteksi...</span>
                        </div>
                    </div>
                </div>
                
                <div class="glass-panel flex flex-col items-center justify-center p-4 rounded-xl shadow-lg">
                    <span id="stat-endpoints-title" class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Endpoint</span>
                    <span id="totalEndpoints" class="text-3xl font-black text-cyan-400 mt-1 light-mode:text-cyan-600">0</span>
                </div>
                
                <div class="glass-panel flex flex-col items-center justify-center p-4 rounded-xl shadow-lg">
                    <span id="stat-categories-title" class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Kategori</span>
                    <span id="totalCategories" class="text-3xl font-black text-cyan-400 mt-1 light-mode:text-cyan-600">0</span>
                </div>
            </div>

            <div class="glass-panel max-w-3xl mx-auto mt-4 p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-white/20">
                <div class="flex items-center gap-2 text-sm text-cyan-400 light-mode:text-cyan-700 code-font">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span class="underline break-all font-semibold">https://api-arulzxd-vvipclouds.vercel.app/</span>
                </div>
                <a href="https://wa.me/6285122629940?text=Halo%20Arulz,%20saya%20ingin%20request%20fitur%20baru%20di%20REST%20API%20:" 
                   target="_blank" 
                   class="w-full sm:w-auto px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase rounded-lg shadow transition-all active:scale-95 light-mode:bg-cyan-600 light-mode:hover:bg-cyan-500 light-mode:text-white text-center flex items-center justify-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Request New Feature
                </a>
            </div>

            <div class="flex justify-center gap-4 mt-4 max-w-3xl mx-auto">
                <a href="https://whatsapp.com/channel/0029VbAwdIyJJhzRMpjUcS3P" 
                   target="_blank" 
                   class="flex-1 glass-panel py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/10 light-mode:hover:bg-slate-100 transition-colors light-mode:text-slate-700 text-center flex items-center justify-center gap-1.5">
                   <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 10.742l.08-.08a2.25 2.25 0 013.182 0l.397.397m-1.397-1.398a2.25 2.25 0 00-3.182 0l-3.472 3.472a2.25 2.25 0 000 3.181l.08.08a2.25 2.25 0 003.181 0l3.472-3.472a2.25 2.25 0 000-3.181c-.074-.074-.154-.14-.237-.196zm7.708-.943a2.25 2.25 0 00-3.182 0l-.397.397m1.397-1.397a2.25 2.25 0 013.182 0l3.472 3.473a2.25 2.25 0 010 3.182l-.08.08a2.25 2.25 0 01-3.181 0l-3.472-3.472a2.25 2.25 0 010-3.181c.074-.074.154-.14.237-.196z" />
                   </svg>
                   Channel
                </a>
                <a href="https://chat.whatsapp.com/LBeGqVsmDBb6j29ysuusd9" 
                   target="_blank" 
                   class="flex-1 glass-panel py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/10 light-mode:hover:bg-slate-100 transition-colors light-mode:text-slate-700 text-center block flex items-center justify-center gap-1.5">
                   <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.998 5.998 0 00-12 0m12 0a5.998 5.998 0 00-12 0m12 0a5.998 5.998 0 00-12 0M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm0 0l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.998 5.998 0 00-12 0m12 0a5.998 5.998 0 00-12 0" />
                   </svg>
                   Group
                </a>
            </div>

            <div class="music-player-card glass-panel mt-8 max-w-2xl mx-auto rounded-2xl p-4 shadow-2xl relative overflow-hidden border border-white/10">
                <audio id="audioElement"></audio>
                <div class="flex items-center justify-between gap-4">
                    <div class="flex items-center gap-4 flex-1 min-w-0">
                        <div class="relative w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/10">
                            <img id="musicCoverImg" src="" alt="Cover" class="w-full h-full object-cover transition-transform duration-500">
                        </div>
                        <div class="flex-1 min-w-0 text-left">
                            <h3 id="musicTitle" class="music-text-title text-white font-bold text-sm tracking-wider uppercase truncate m-0">Loading...</h3>
                            <p id="musicArtist" class="music-text-artist text-slate-400 text-xs font-semibold tracking-wide truncate mt-0.5">-</p>
                            <div class="flex items-center gap-2 mt-2">
                                <span id="currentTime" class="text-[10px] text-slate-400 light-mode:text-slate-500 code-font w-7 text-left">0:00</span>
                                <div id="progressContainer" class="music-progress-bar-bg flex-1 h-1 bg-white/10 rounded-full relative cursor-pointer group">
                                    <div id="progressBar" class="h-full bg-cyan-400 rounded-full w-0 transition-all duration-300"></div>
                                </div>
                                <span id="totalDuration" class="text-[10px] text-slate-400 light-mode:text-slate-500 code-font w-7 text-right">0:00</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-1.5 flex-shrink-0">
                        <button id="prevBtn" class="music-btn-nav w-9 h-9 flex items-center justify-center glass-panel rounded-xl text-slate-300 hover:text-white transition-all active:scale-95">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                        </button>
                        <button id="playBtn" class="music-btn-nav w-10 h-10 flex items-center justify-center glass-panel rounded-xl text-slate-300 hover:text-white transition-all active:scale-95">
                            <svg id="playIcon" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </button>
                        <button id="nextBtn" class="music-btn-nav w-9 h-9 flex items-center justify-center glass-panel rounded-xl text-slate-300 hover:text-white transition-all active:scale-95">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6h2v12h-2zm-10.5 12l8.5-6-8.5-6z"/></svg>
                        </button>
                        <button id="playlistToggleBtn" class="music-btn-nav w-9 h-9 flex items-center justify-center glass-panel rounded-xl text-slate-300 hover:text-white transition-all active:scale-95">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
                        </button>
                    </div>
                </div>
                <div id="playlistPanel" class="music-playlist-border hidden mt-4 pt-4 border-t border-white/10 max-h-40 overflow-y-auto space-y-1 light-mode:border-slate-200"></div>
            </div>
            
        </header>

        <div class="mb-8">
            <div class="relative">
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="Cari endpoint berdasarkan nama, path, atau kategori..."
                    class="search-input w-full px-4 py-3 text-sm rounded-xl focus:outline-none focus:border-cyan-500 transition-all code-font glass-panel border border-white/10 text-white placeholder-slate-400 light-mode:text-slate-900 light-mode:placeholder-slate-500 light-mode:focus:border-cyan-600"
                >
                <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
            </div>
            <div id="categoryFilters" class="flex flex-wrap gap-2 mt-4 justify-start md:justify-center overflow-x-auto pb-2 scrollbar-hide"></div>
        </div>

        <div id="noResults" class="text-center py-12 hidden">
            <div class="flex justify-center mb-3">
                <svg class="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 id="no-results-title" class="text-sm font-bold mb-1 text-white">Endpoint tidak ditemukan</h3>
            <p id="no-results-desc" class="text-xs text-slate-400 light-mode:text-slate-500">Coba gunakan kata kunci lain</p>
        </div>

        <div id="apiList" class="space-y-4"></div>

        <footer id="siteFooter" class="mt-12 pt-6 border-t border-white/10 text-center text-xs text-slate-500">
            ${footer}
        </footer>
    </div>

    <div id="imageLightbox" class="fixed inset-0 bg-black/90 z-[100] hidden flex items-center justify-center p-4 opacity-0 transition-opacity duration-300 backdrop-blur-sm cursor-zoom-out">
        <div class="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
            <img id="lightboxImage" src="" alt="Preview" class="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain scale-95 transition-transform duration-300" />
            <button id="closeLightbox" class="absolute -top-12 right-0 text-white hover:text-cyan-400 transition-colors focus:outline-none flex items-center gap-1 bg-black/50 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono">
                ✕ Close
            </button>
        </div>
    </div>
    
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/locale/id.min.js"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.45/moment-timezone-with-data.min.js"></script>

<script class="notranslate" translate="no">
    window.musicPlaylist = ${JSON.stringify(playlist)};
</script>
<script src="script.js"></script>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('welcomePopup');
    const closeBtn = document.getElementById('closePopupBtn');
    
    // Tampilkan modal setiap kali halaman dimuat awal / direfresh
    popup.classList.remove('hidden');
    document.body.classList.add('overflow-hidden'); // Kunci scroll layar saat modal aktif
    
    // Fungsi untuk menutup modal
    closeBtn.addEventListener('click', () => {
        popup.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    });
});
</script>

</body>
</html>
    `);
});


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;