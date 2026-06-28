/* =========================================================================
   API-ARULZXD - REST API & UPLOADER INTEGRATION (UPDATED)
   ========================================================================= */

const express = require('express');
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const mime = require('mime-types');
const https = require('https');
const http = require('http');
const crypto = require('crypto');

// Import data notifikasi di bagian atas index.js
const listNotifikasi = require('./notifikasi'); 

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname)));
app.use(express.json());

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

app.get('/uploader', (req, res) => {
  res.sendFile(path.join(__dirname, 'uploader.html'));
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

app.use('/api', router);

app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});
app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/', (req, res) => {
    // Generate Notifikasi HTML Items
    let notifHtmlItems = '';
    if (Array.isArray(listNotifikasi)) {
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
    }

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

    <div class="fixed top-6 right-6 z-40 flex items-center gap-3">
        <button id="notifMenuBtn" class="relative flex items-center justify-center w-12 h-12 rounded-xl glass-panel text-slate-300 hover:text-white shadow-lg transition-all active:scale-95 focus:outline-none light-mode:text-slate-700 light-mode:hover:text-slate-900">
            <svg class="w-6 h-6 animate-[swing_2s_ease-in-out_infinite]" fill="none" stroke="currentColor" stroke-width="2.3" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span id="notifBadge" class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md border border-slate-900 animate-pulse">1</span>
        </button>

        <button id="bioMenuBtn" class="flex items-center justify-center w-12 h-12 rounded-xl glass-panel text-slate-300 hover:text-white shadow-lg transition-all active:scale-95 focus:outline-none light-mode:text-slate-700 light-mode:hover:text-slate-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
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
                    <h3 class="text-lg font-bold text-white flex items-center gap-2">🔔 Pusat Pemberitahuan</h3>
                    <p class="text-xs text-slate-400">Informasi update fitur dan sistem berkala</p>
                </div>
                
                <div class="space-y-3 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                    ${notifHtmlItems}
                </div>
            </div>
        </div>
    </div>

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
            <p>Halloo, ini adalah salah satu projek ku, jangan di hujat yaa masih pemula :D</p>
          </div>
          
          <div class="mb-6 flex justify-center">
            <div class="bg-black/30 rounded-full py-2.5 px-6 border-2 border-dashed border-cyan-500/50 shadow-inner">
              <span class="font-bold text-xs sm:text-sm text-slate-200 tracking-wide">
                Free apikey : <span class="font-mono text-cyan-400 select-all">${VALID_API_KEY}</span>
              </span>
            </div>
          </div>
          
          <div class="text-center text-slate-400 text-[11px] mb-5 flex items-center justify-center gap-1.5 font-medium tracking-wide">
            <span>Support project ini biar makin semangat</span>
            <span class="text-base animate-bounce">🚀</span>
          </div>
          
          <a href="https://wa.me/6285122629940?text=Halo%20Arulz%2C%20saya%20ingin%20donate%20untuk%20layanan%20REST%20API%20Anda." target="_blank" class="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-cyan-950/50 transition-all active:scale-95 text-sm block text-center tracking-wider uppercase">
            Donate Sekarang
          </a>
        </div>
      </div>
    </div>

    <div id="toast" class="toast z-50">
        <div class="flex items-center gap-3">
            <svg id="toastIcon" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
            <span id="toastMessage" class="text-sm font-semibold tracking-wide"></span>
            <button id="closeToastBtn" class="absolute -top-12 right-0 text-white hover:text-cyan-400 transition-colors focus:outline-none flex items-center gap-1 bg-black/50 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono">
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

    // Logika buka-tutup Pusat Pemberitahuan (Notifikasi)
    const notifMenuBtn = document.getElementById('notifMenuBtn');
    const notifPopup = document.getElementById('notifPopup');
    const closeNotifBtn = document.getElementById('closeNotifBtn');
    const notifOverlay = document.getElementById('notifOverlay');
    const notifBadge = document.getElementById('notifBadge');

    if (notifMenuBtn && notifPopup) {
        notifMenuBtn.addEventListener('click', () => {
            notifPopup.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
            if (notifBadge) notifBadge.classList.add('hidden'); // Sembunyikan badge jika sudah dibuka
        });
    }

    const closeNotifFunc = () => {
        notifPopup.classList.add('hidden');
        if (!popup || popup.classList.contains('hidden')) {
            document.body.classList.remove('overflow-hidden');
        }
    };

    if (closeNotifBtn) closeNotifBtn.addEventListener('click', closeNotifFunc);
    if (notifOverlay) notifOverlay.addEventListener('click', closeNotifFunc);
});
</script>
</body>
</html>`);
});

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


module.exports = app;