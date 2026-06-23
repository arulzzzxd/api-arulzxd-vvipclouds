const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname)));
app.use(express.json());

/*
For setting API name etc
*/
const title = "API-ARULZXD - REST";
const favicon = "https://arulz-uploader.vercel.app/files/C5VYmq.jpg";
const logo = "https://arulz-uploader.vercel.app/files/SnhJe3.png";
// Mengubah headertitle menjadi tag img SVG
const headertitle = `<img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=700&size=28&pause=1000&color=00D4FF&center=true&vCenter=true&width=600&lines=Welcome+To+ArulzXD+API;Fast+%F0%9F%9A%80+Reliable+%E2%9A%A1;Free+REST+API+Services;Developer+Friendly+API" alt="Typing SVG" class="mx-auto" />`;
const headerdescription = "Browse, inspect & fire requests against live endpoints._";
const footer = "© Arulz-XD";

// API KEY CONFIGURATION
const VALID_API_KEY = "arulzxd-keys"; // Key Free
const PREMIUM_API_KEYS = ["arulz-premium", "key-vip-arulz", "owner-key-999"]; // List Key Premium

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

const router = express.Router();
const apiPath = path.join(__dirname, 'api');

// Middleware untuk memvalidasi API Key (Kecuali endpoint /apilist)
const validateApiKey = (req, res, next) => {
  if (req.path === '/apilist') {
    return next();
  }

  const userKey = req.query.apikey;
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

  // DINAMIS: Cek Status Fitur & Hak Akses Fitur Premium
  const pathParts = req.path.split('/');
  const currentCategory = pathParts[1]; 
  const currentRouteName = pathParts[2];   

  if (currentCategory && currentRouteName) {
    try {
      const routeFilePath = path.join(apiPath, currentCategory, `${currentRouteName}.js`);
      if (fs.existsSync(routeFilePath)) {
        const routeModule = require(routeFilePath);

        // Cek Status Fitur (Maintenance/Perbaikan)
        if (routeModule.status === "error" || routeModule.status === "perbaikan") {
          return res.status(503).json({
            status: false,
            creator: "Arulz-XD",
            message: "Fitur ini sedang dalam perbaikan / maintenance!"
          });
        }

        // Cek Tipe Fitur Premium
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

// Pasang middleware validasi ke router API
router.use(validateApiKey);

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

// PERBAIKAN: Menambahkan properti type agar tersinkronisasi ke dokumentasi frontend
function getEndpointsFromRouter(category, file) {
  const endpoints = [];
  const route = require(path.join(apiPath, category, file));
  const subRouter = route.stack ? route : route.router || route;
  if (!subRouter || !subRouter.stack) return endpoints;
  subRouter.stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());

      // Otomatis daftarkan parameter apikey di paling awal agar muncul di UI dokumentasi
      let params = { apikey: "text" }; 

      if (layer.route.stack && layer.route.stack.length) {
        layer.route.stack.forEach(mw => {
          const fnString = mw.handle.toString();
          
          // Cek parameter query string
          [...fnString.matchAll(/req\.query\.([a-zA-Z0-9_]+)/g)].forEach(match => {
            if (match[1] !== 'apikey') params[match[1]] = "text";
          });
          
          // Cek parameter body
          [...fnString.matchAll(/req\.body\.([a-zA-Z0-9_]+)/g)].forEach(match => {
            params[match[1]] = "text";
          });

          // FITUR BARU: Deteksi jika menggunakan upload file (multer / req.file / req.files)
          if (fnString.includes('req.file') || fnString.includes('req.files') || fnString.includes('file')) {
             // Jika metodenya POST, otomatis buatkan parameter bertipe file jika belum ada parameter spesifik body
             if (methods.includes('POST') || methods.includes('PUT')) {
                params['file'] = "file";
             }
          }
        });
      }
      
      // Jika terdeteksi di nama file mengandung uploader/upload, pastikan ada param file
      if ((file.toLowerCase().includes('upload') || file.toLowerCase().includes('uploader')) && (methods.includes('POST') || methods.includes('PUT'))) {
         if (!params['file']) params['file'] = "file";
      }

      endpoints.push({
        name: `/${category}/${file.replace(/\.js$/,"")}`,
        path: `/api/${category}/${file.replace(/\.js$/,"")}`,
        desc: `/${category}/${file.replace(/\.js$/,"")}`,
        status: route.status || "ready",
        type: route.type || "free", // <-- Menyimpan properti tipe akses (free/premium)
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
        params: {},
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
    res.send(`<!DOCTYPE html>
<html lang="en" class="notranslate" translate="no">
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

    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    </style>
</head>
<body class="min-h-screen antialiased bg-[#030712] text-slate-100 relative">
    <div id="themeBg" class="fixed inset-0 -z-10 bg-dots-dark"></div>

    <div id="toast" class="toast z-50">
        <div class="flex items-center gap-3">
            <svg id="toastIcon" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span id="toastMessage" class="font-medium">Action completed</span>
        </div>
    </div>

    <div class="fixed top-6 right-6 z-40">
        <button id="bioMenuBtn" class="flex items-center justify-center w-12 h-12 rounded-xl glass-panel text-slate-300 hover:text-white shadow-lg transition-all active:scale-95 focus:outline-none light-mode:text-slate-700 light-mode:hover:text-slate-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    </div>

    <div id="bioDropdown" class="fixed top-0 right-0 h-full w-72 bg-[#08111e]/90 backdrop-blur-md border-l border-white/10 z-40 transform translate-x-full transition-transform duration-300 ease-in-out p-6 flex flex-col justify-between light-mode:bg-white/90 light-mode:border-black/10">
        <div>
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-bold text-lg text-cyan-400 font-mono">Menu & Bio</h3>
                <button id="closeBioMenu" class="text-slate-400 hover:text-white text-xl font-bold font-mono">✕</button>
            </div>
            <div class="flex flex-col items-center mb-6">
                <img src="${logo}" alt="Profile" class="w-20 h-20 rounded-full border-2 border-cyan-400 p-1 mb-3 bg-slate-900 object-cover" />
                <h4 class="font-bold text-base font-mono">Arulz-XD</h4>
                <p class="text-xs text-slate-400 font-mono">Fullstack Developer</p>
            </div>
            <div class="space-y-3">
                <button id="uploaderMenuBtn" class="w-full text-left p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/50 border border-white/5 transition-all flex items-center gap-3 text-sm font-mono light-mode:bg-slate-100 light-mode:hover:bg-slate-200 light-mode:border-black/5">
                    📁 Uploader Web
                </button>
                <button id="pastebinMenuBtn" class="w-full text-left p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/50 border border-white/5 transition-all flex items-center gap-3 text-sm font-mono light-mode:bg-slate-100 light-mode:hover:bg-slate-200 light-mode:border-black/5">
                    📋 Paste Code
                </button>
            </div>
        </div>
        <div class="text-center text-xs text-slate-500 font-mono">
            v1.2.0 Stable Build
        </div>
    </div>
    <div id="menuOverlay" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 hidden transition-opacity duration-300"></div>

    <div class="max-w-7xl mx-auto px-4 py-8 lg:py-12 relative min-h-screen flex flex-col justify-between">
        <header class="text-center mb-12 relative">
            <div class="mb-4 inline-block transform hover:rotate-12 transition-transform duration-300">
                <img src="${logo}" alt="Logo" class="w-16 h-16 md:w-20 md:h-20 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] object-contain" />
            </div>
            <h1 id="mainTitle" class="text-3xl md:text-4xl font-extrabold tracking-tight font-space text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2 select-none">
                ${headertitle}
            </h1>
            <p id="mainDescription" class="text-slate-400 text-sm md:text-base font-mono max-w-xl mx-auto border-b border-white/5 pb-6">
                ${headerdescription}
            </p>

            <div class="flex items-center justify-center gap-3 mt-4">
                <button id="lang-id" class="lang-btn rounded-md" onclick="setLanguage('id')">ID</button>
                <button id="lang-en" class="lang-btn rounded-md" onclick="setLanguage('en')">EN</button>
                <div class="h-5 w-[1px] bg-white/20 mx-1"></div>
                <button id="themeToggle" class="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-all light-mode:border-black/10 light-mode:hover:bg-black/5" title="Toggle Theme">
                    <svg id="theme-toggle-dark-icon" class="w-4 h-4 text-cyan-400 hidden" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
                    <svg id="theme-toggle-light-icon" class="w-4 h-4 text-amber-500 hidden" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 17.95a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm-2.122-10.6a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                </button>
            </div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mb-8 flex-grow">
            <div class="space-y-6 lg:sticky lg:top-8">
                <div class="glass-panel rounded-2xl p-6 shadow-xl transition-all duration-300">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-mono flex items-center gap-2">
                        <span class="flex h-2 w-2 relative">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span> System Metrics
                    </h3>
                    <div class="grid grid-cols-1 gap-4 font-mono">
                        <div class="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col justify-between min-h-[70px] transition-all light-mode:bg-slate-50 light-mode:border-black/5">
                            <span id="stat-battery-title" class="text-[11px] text-slate-400 font-semibold">Your Battery</span>
                            <div class="flex items-center justify-between mt-1">
                                <span id="batteryStatus" class="text-xs text-slate-300 font-bold max-w-[150px] truncate">Detecting...</span>
                                <div id="batteryContainer" class="battery-container border border-slate-500/30 rounded px-1.5 py-0.5 flex items-center gap-1.5 min-w-[75px] h-6 justify-end relative overflow-hidden bg-slate-950/20">
                                    <div id="batteryLevel" class="battery-level bg-cyan-500" style="width: 0%;"></div>
                                    <span id="batteryPercentage" class="text-[10px] font-bold text-white z-10 select-none">0%</span>
                                </div>
                            </div>
                        </div>
                        <div class="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col justify-between min-h-[70px] transition-all light-mode:bg-slate-50 light-mode:border-black/5">
                            <span id="stat-endpoints-title" class="text-[11px] text-slate-400 font-semibold">Total Endpoints</span>
                            <div class="flex items-baseline gap-1 mt-1">
                                <span id="totalEndpoints" class="text-xl font-bold text-cyan-400">0</span>
                                <span class="text-[10px] text-slate-400 uppercase font-bold tracking-tight">active</span>
                            </div>
                        </div>
                        <div class="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col justify-between min-h-[70px] transition-all light-mode:bg-slate-50 light-mode:border-black/5">
                            <span id="stat-categories-title" class="text-[11px] text-slate-400 font-semibold">Total Categories</span>
                            <div class="flex items-baseline gap-1 mt-1">
                                <span id="totalCategories" class="text-xl font-bold text-blue-400">0</span>
                                <span class="text-[10px] text-slate-400 uppercase font-bold tracking-tight">modules</span>
                            </div>
                        </div>
                        <div class="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col justify-between min-h-[70px] transition-all light-mode:bg-slate-50 light-mode:border-black/5">
                            <span class="text-[11px] text-slate-400 font-semibold">Jakarta Time & Date</span>
                            <div class="flex flex-col mt-1 leading-tight">
                                <span id="liveClock" class="text-lg font-bold text-cyan-400 tracking-wider">00:00:00</span>
                                <span id="liveDate" class="text-[11px] text-slate-400 mt-0.5 truncate">Detecting date...</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="glass-panel rounded-2xl p-5 shadow-xl font-mono music-player-card transition-all duration-300">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                            <svg class="w-4 h-4 text-cyan-400 animate-spin" style="animation-duration: 4s;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke-dasharray="6 6"/>
                            </svg> Radio Player
                        </span>
                        <span id="musicStatus" class="text-[10px] px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full font-bold uppercase tracking-wide">IDLE</span>
                    </div>
                    <div class="flex gap-4 items-center mb-4">
                        <img id="musicCover" src="${favicon}" alt="Cover" class="w-16 h-16 rounded-xl border border-white/10 shadow-md object-cover bg-slate-900 transition-all duration-300" />
                        <div class="overflow-hidden flex-1 leading-tight">
                            <h4 id="musicTitle" class="font-bold text-sm text-slate-200 truncate music-text-title">No track selected</h4>
                            <p id="musicArtist" class="text-xs text-slate-400 truncate mt-0.5 music-text-artist">Unknown Artist</p>
                        </div>
                    </div>
                    <div class="w-full music-progress-bar-bg bg-slate-900 rounded-full h-1 mb-4 overflow-hidden relative cursor-pointer" id="musicProgressContainer">
                        <div id="musicProgressBar" class="bg-cyan-400 h-full w-0 rounded-full transition-all duration-200"></div>
                    </div>
                    <div class="flex justify-between items-center text-[10px] text-slate-400 mb-4 px-0.5">
                        <span id="musicTimeCurrent">00:00</span>
                        <span id="musicTimeTotal">00:00</span>
                    </div>
                    <div class="grid grid-cols-3 gap-2">
                        <button id="musicPrevBtn" class="music-btn-nav p-2 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl transition-all text-center flex items-center justify-center font-bold text-xs select-none active:scale-95">◀◀</button>
                        <button id="musicPlayBtn" class="music-btn-nav p-2 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-400 rounded-xl transition-all text-center flex items-center justify-center font-bold text-xs select-none active:scale-95">PLAY</button>
                        <button id="musicNextBtn" class="music-btn-nav p-2 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl transition-all text-center flex items-center justify-center font-bold text-xs select-none active:scale-95">▶▶</button>
                    </div>
                </div>

                <div class="social-badge grid grid-cols-2 gap-3 font-mono">
                    <a href="https://github.com/ArulzXD" target="_blank" class="block">
                        <div class="px-4 py-2 rounded-xl text-xs font-bold transition-colors text-center border bg-slate-900/40 text-slate-200 hover:bg-slate-800/60 border-white/10 shadow-sm">
                            GitHub Profile
                        </div>
                    </a>
                    <a href="https://wa.me/6281232671049" target="_blank" class="block">
                        <div class="px-4 py-2 rounded-xl text-xs font-bold transition-colors text-center border bg-slate-900/40 text-slate-200 hover:bg-slate-800/60 border-white/10 shadow-sm">
                            WhatsApp Dev
                        </div>
                    </a>
                </div>
            </div>

            <div class="lg:col-span-2 space-y-6">
                <div class="glass-panel rounded-2xl p-4 md:p-6 shadow-xl relative transition-all duration-300">
                    <div class="relative flex items-center mb-4">
                        <span class="absolute left-4 text-slate-400 select-none font-mono text-sm">🔍</span>
                        <input type="text" id="searchInput" placeholder="Cari endpoint berdasarkan nama, path, atau kategori..." class="w-full pl-11 pr-4 py-3 bg-slate-900/40 border border-white/10 rounded-xl text-sm font-mono text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-all light-mode:bg-white light-mode:border-black/10 light-mode:text-slate-900" autocomplete="off" />
                    </div>

                    <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide select-none" id="categoryFilters">
                        <button class="filter-btn active" data-category="all">All</button>
                    </div>
                </div>

                <div id="apiList" class="space-y-6 min-h-[200px]"></div>

                <div id="noResults" class="hidden glass-panel rounded-2xl p-12 text-center border border-white/5 font-mono shadow-xl transition-all duration-300">
                    <div class="text-4xl mb-4 select-none">📭</div>
                    <h3 id="no-results-title" class="font-bold text-lg text-slate-200 mb-1">Endpoint tidak ditemukan</h3>
                    <p id="no-results-desc" class="text-sm text-slate-400">Coba gunakan kata kunci lain</p>
                </div>
            </div>
        </div>

        <footer id="siteFooter" class="text-center text-xs text-slate-500 font-mono pt-8 border-t border-white/5 select-none">
            ${footer}
        </footer>
    </div>

    <div id="imageLightbox" class="fixed inset-0 bg-black/90 z-[100] hidden flex items-center justify-center p-4 opacity-0 transition-opacity duration-300 backdrop-blur-sm cursor-zoom-out\">\n        <div class="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
            <img id="lightboxImage" src="" alt="Preview" class="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain scale-95 transition-transform duration-300" />
            <button id="closeLightbox" class="absolute -top-12 right-0 text-white hover:text-cyan-400 transition-colors focus:outline-none flex items-center gap-1 bg-black/50 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono">
                ✕ Close
            </button>
        </div>
    </div>
    
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/locale/id.min.js"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.45/moment-timezone-with-data.min.js"></script>
<script src="script.js"></script>

<script>
    // Menyimpan data playlist musik ke global window agar dapat diakses oleh script.js
    window.musicPlaylistData = ${JSON.stringify(playlist)};
</script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});