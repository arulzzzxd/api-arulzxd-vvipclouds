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

// PERBAIKAN: Menambahkan dukungan POST parameter parser & multi-methods
function getEndpointsFromRouter(category, file) {
  const endpoints = [];
  const route = require(path.join(apiPath, category, file));
  const subRouter = route.stack ? route : route.router || route;
  if (!subRouter || !subRouter.stack) return endpoints;
  subRouter.stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());

      // Otomatis daftarkan parameter apikey di paling awal agar muncul di UI dokumentasi
      let params = { apikey: "" }; 

      if (layer.route.stack && layer.route.stack.length) {
        layer.route.stack.forEach(mw => {
          const fnString = mw.handle.toString();
          // Deteksi parameter req.query (untuk rute GET)
          [...fnString.matchAll(/req\.query\.([a-zA-Z0-9_]+)/g)].forEach(match => {
            if (match[1] !== 'apikey') params[match[1]] = "";
          });
          // Deteksi parameter req.body (untuk rute POST)
          [...fnString.matchAll(/req\.body\.([a-zA-Z0-9_]+)/g)].forEach(match => {
            params[match[1]] = "";
          });
        });
      }
      endpoints.push({
        name: `/${category}/${file.replace(/\.js$/,"")}`,
        path: `/api/${category}/${file.replace(/\.js$/,"")}`,
        desc: `/${category}/${file.replace(/\.js$/,"")}`,
        status: route.status || "ready",
        type: route.type || "free", // Menyimpan properti tipe akses (free/premium)
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
    <div id="bioDropdown" class="fixed top-0 right-0 h-full w-72 bg-[#08111e]/95 backdrop-blur-lg border-l border-white/10 transform translate-x-full transition-transform duration-300 z-50 p-6 flex flex-col justify-between shadow-2xl">
        <div class="flex flex-col gap-6">
            <div class="flex items-center justify-between">
                <h3 class="font-bold text-lg text-cyan-400 font-mono">⚡ DEVELOPER INFO</h3>
                <button id="closeBioBtn" class="text-slate-400 hover:text-white transition-colors focus:outline-none text-xl p-1 font-mono">✕</button>
            </div>
            <div class="flex flex-col items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 light-mode:bg-black/5 light-mode:border-black/5">
                <img src="${logo}" alt="Profile" class="w-20 h-20 rounded-full border-2 border-cyan-400 object-cover shadow-lg shadow-cyan-500/20" />
                <div class="text-center">
                    <h4 class="font-bold text-md text-slate-100 light-mode:text-slate-900">Arulz-XD</h4>
                    <p class="text-xs text-cyan-400 font-mono mt-0.5">Fullstack Developer</p>
                </div>
            </div>
            <div class="flex flex-col gap-2 font-mono text-xs">
                <div class="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center light-mode:bg-black/5 light-mode:border-black/5">
                    <span class="text-slate-400">Library</span>
                    <span class="text-slate-200 font-bold">Express.js</span>
                </div>
                <div class="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center light-mode:bg-black/5 light-mode:border-black/5">
                    <span class="text-slate-400">Language</span>
                    <span class="text-slate-200 font-bold">JavaScript (Node)</span>
                </div>
                <div class="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-2 light-mode:bg-black/5 light-mode:border-black/5">
                    <span class="text-slate-400">Free Api Key:</span>
                    <div class="flex gap-1 items-center bg-black/30 p-2 rounded-lg justify-between border border-white/5 light-mode:bg-white/50">
                        <code class="text-cyan-400 font-bold select-all overflow-x-auto scrollbar-hide mr-1">${VALID_API_KEY}</code>
                        <button onclick="navigator.clipboard.writeText('${VALID_API_KEY}').then(() => window.showToast('API Key copied!'))" class="p-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-md transition-colors">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                        </button>
                    </div>
                </div>
            </div>
            <div class="flex flex-col gap-2 font-mono text-xs mt-2">
                <span class="text-slate-400 pl-1 mb-1 block">Quick Utilities</span>
                <button id="uploaderMenuBtn" class="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/20 text-purple-300 font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    📥 File Uploader
                </button>
                <button id="pastebinMenuBtn" class="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/50 hover:to-teal-600/50 border border-emerald-500/20 text-emerald-300 font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-1">
                    📋 Code Pastebin
                </button>
            </div>
        </div>
        <div class="flex flex-col gap-3 font-mono">
            <div class="flex justify-between items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/5 light-mode:bg-white/50">
                <button id="lang-id" onclick="setLanguage('id')" class="flex-1 text-center py-1.5 rounded-lg text-xs font-bold transition-all border border-transparent">ID</button>
                <button id="lang-en" onclick="setLanguage('en')" class="flex-1 text-center py-1.5 rounded-lg text-xs font-bold transition-all border border-transparent">EN</button>
            </div>
            <button id="themeToggle" class="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 font-bold text-xs text-slate-300 transition-colors flex items-center justify-center gap-2 light-mode:bg-black/5 light-mode:border-black/5 light-mode:text-slate-700">
                <span id="theme-toggle-dark-icon" class="flex items-center gap-2">☀️ Light Mode</span>
                <span id="theme-toggle-light-icon" class="hidden flex items-center gap-2">🌙 Dark Mode</span>
            </button>
        </div>
    </div>
    <div id="menuOverlay" class="fixed inset-0 bg-black/60 z-40 hidden backdrop-blur-sm transition-opacity duration-300 opacity-0"></div>

    <div class="max-w-6xl mx-auto px-4 pt-12 pb-24 relative z-10 flex flex-col min-h-screen">
        <header class="text-center mb-12 flex flex-col items-center">
            <div id="mainTitle" class="mb-4 max-w-full overflow-hidden px-2">
                ${headertitle}
            </div>
            <p id="mainDescription" class="text-slate-400 font-mono text-sm tracking-wide max-w-xl mx-auto line-clamp-2 md:line-clamp-none">${headerdescription}</p>
        </header>

        <section class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div id="batteryContainer" class="glass-panel p-5 rounded-2xl flex flex-col justify-between group transition-all duration-300 hover:border-cyan-500/30">
                <div class="flex items-center justify-between mb-2">
                    <span id="stat-battery-title" class="text-xs font-bold font-mono tracking-wider text-slate-400">YOUR BATTERY</span>
                    <div class="battery-icon-container">
                        <div class="battery-body">
                            <div id="batteryLevel" class="battery-level bg-green-500" style="width: 0%"></div>
                        </div>
                        <div class="battery-cap"></div>
                    </div>
                </div>
                <div class="flex items-baseline gap-2 mt-2">
                    <span id="batteryPercentage" class="text-3xl font-extrabold font-mono tracking-tight text-cyan-400">...</span>
                    <span id="batteryStatus" class="text-xs font-mono text-slate-400 truncate max-w-[150px]">Detecting...</span>
                </div>
            </div>

            <div class="glass-panel p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-cyan-500/30">
                <div class="flex items-center justify-between mb-2">
                    <span id="stat-endpoints-title" class="text-xs font-bold font-mono tracking-wider text-slate-400">TOTAL ENDPOINTS</span>
                    <div class="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                    </div>
                </div>
                <div class="flex items-baseline gap-2 mt-2">
                    <span id="totalEndpoints" class="text-3xl font-extrabold font-mono tracking-tight text-cyan-400">0</span>
                    <span class="text-xs font-mono text-slate-400">endpoints ready</span>
                </div>
            </div>

            <div class="glass-panel p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-cyan-500/30">
                <div class="flex items-center justify-between mb-2">
                    <span id="stat-categories-title" class="text-xs font-bold font-mono tracking-wider text-slate-400">TOTAL CATEGORIES</span>
                    <div class="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                    </div>
                </div>
                <div class="flex items-baseline gap-2 mt-2">
                    <span id="totalCategories" class="text-3xl font-extrabold font-mono tracking-tight text-cyan-400">0</span>
                    <span class="text-xs font-mono text-slate-400">categories active</span>
                </div>
            </div>
        </section>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-start">
            <div class="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 md:col-span-2 music-player-card">
                <div class="relative w-20 h-20 flex-shrink-0 group rounded-xl overflow-hidden shadow-md">
                    <img id="musicCover" src="${playlist[0].cover}" alt="Album Art" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div id="musicLoadingDisc" class="absolute inset-0 bg-black/60 flex items-center justify-center hidden rounded-xl">
                        <div class="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
                <div class="flex-1 min-w-0 w-full flex flex-col justify-center">
                    <div class="flex justify-between items-start gap-2 mb-1">
                        <div class="min-w-0 flex-1">
                            <h4 id="musicTitle" class="font-bold text-sm text-slate-100 truncate font-mono music-text-title">${playlist[0].title}</h4>
                            <p id="musicArtist" class="text-xs text-slate-400 truncate font-mono mt-0.5 music-text-artist">${playlist[0].artist}</p>
                        </div>
                        <div id="musicWaveContainer" class="flex items-end gap-0.5 h-4 mt-1 px-1 flex-shrink-0">
                            <div class="w-0.5 bg-cyan-400 h-2 animate-music-wave-1"></div>
                            <div class="w-0.5 bg-cyan-400 h-3 animate-music-wave-2"></div>
                            <div class="w-0.5 bg-cyan-400 h-1 animate-music-wave-3"></div>
                            <div class="w-0.5 bg-cyan-400 h-4 animate-music-wave-4"></div>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-2 mb-3">
                        <span id="musicCurrentTime" class="text-[10px] font-mono text-slate-500 w-8">00:00</span>
                        <div id="musicProgressBarBg" class="flex-1 h-1 bg-white/10 rounded-full cursor-pointer relative music-progress-bar-bg group">
                            <div id="musicProgressBar" class="h-full bg-cyan-400 rounded-full w-0 transition-all duration-100 relative">
                                <div class="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow shadow-black"></div>
                            </div>
                        </div>
                        <span id="musicTotalTime" class="text-[10px] font-mono text-slate-500 w-8 text-right">00:00</span>
                    </div>
                    
                    <div class="flex items-center justify-center md:justify-start gap-4">
                        <button id="musicPrevBtn" class="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all hover:bg-white/10 active:scale-95 music-btn-nav">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                        </button>
                        <button id="musicPlayBtn" class="p-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 transition-all active:scale-95">
                            <svg id="musicPlayIcon" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            <svg id="musicPauseIcon" class="w-4 h-4 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        </button>
                        <button id="musicNextBtn" class="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all hover:bg-white/10 active:scale-95 music-btn-nav">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6zm9-12v12h2V6z"/></svg>
                        </button>
                    </div>
                </div>
                <audio id="mainAudio" src="${playlist[0].url}" preload="metadata"></audio>
            </div>

            <div class="glass-panel p-4 rounded-2xl flex flex-col justify-center h-full min-h-[116px] md:min-h-0 font-mono text-center md:text-right">
                <div id="liveClock" class="text-4xl font-extrabold tracking-wider text-cyan-400 leading-none mb-1.5 drop-shadow-[0_2px_8px_rgba(6,182,212,0.15)]">00:00:00</div>
                <div id="liveDate" class="text-xs text-slate-400 font-bold tracking-wide">Loading date...</div>
                <div class="text-[10px] text-slate-500 mt-1 font-semibold">Asia/Jakarta (WIB)</div>
            </div>
        </div>

        <main class="flex-1 flex flex-col md:flex-row gap-6 items-start">
            <aside class="w-full md:w-64 flex-shrink-0 md:sticky md:top-6 flex flex-col gap-3">
                <div class="relative w-full">
                    <input type="text" id="searchInput" class="w-full bg-[#0d1527]/60 border border-white/10 rounded-xl px-4 py-3 pl-11 text-sm font-mono focus:outline-none focus:border-cyan-500/50 text-slate-200 placeholder-slate-500 transition-all shadow-inner" placeholder="Cari endpoint..." />
                    <svg class="w-4 h-4 text-slate-500 absolute left-4 top-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
                
                <div id="categoryContainer" class="flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full max-w-full">
                    </div>
            </aside>

            <div class="flex-1 w-full flex flex-col gap-4">
                <div id="noResultsCard" class="glass-panel p-12 text-center rounded-2xl hidden transition-all">
                    <div class="text-5xl mb-4 animate-bounce">🔍</div>
                    <h3 id="no-results-title" class="font-bold text-lg text-slate-200 mb-1">Endpoint tidak ditemukan</h3>
                    <p id="no-results-desc" class="text-sm text-slate-400 font-mono">Coba gunakan kata kunci lain</p>
                </div>

                <div id="apiList" class="flex flex-col gap-4 w-full">
                    </div>
            </div>
        </main>

        <footer id="siteFooter" class="mt-24 pt-6 border-t border-white/10 text-center text-xs text-slate-500">
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
<script src="script.js"></script>

<script>
    const playlistData = ${JSON.stringify(playlist)};
</script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Server is running smoothly on port ${PORT}`);
});