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
const headertitle = `<img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=700&size=28&pause=1000&color=00D4FF&center=true&vCenter=true&width=600&lines=Welcome+To+ArulzXD+API;Fast+%F0%9F%9A%80+Reliable+%E2%9A%A1;Free+REST+API+Services;Developer+Friendly+API" alt="Typing SVG" class="mx-auto" />`;
const headerdescription = "Browse, inspect & fire requests against live endpoints._";
const footer = "ﾂｩ Arulz-XD";

// API KEY CONFIGURATION (DIPISAH FREE & PREMIUM)
const FREE_API_KEYS = ["arulzxd-keys", "free-key-2"];
const PREMIUM_API_KEYS = ["premium-arulz", "vip-user-key"]; // Tambahkan custom apikey premium Anda di sini

// === KONFIGURASI PLAYLIST BANYAK MUSIK ===
const playlist = [
  {
    title: "PAMIT KERJO",
    artist: "NDX. AKA",
    cover: "https://raw.githubusercontent.com/upload-file-lab/fileupload7/main/uploads/1764494355026.jpeg",
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
    cover: "https://i.ytimg.com/vi/Q28Uj8O4Dmg/hq720.jpg",
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
const endpointDirs = fs.readdirSync(apiPath).filter(f => fs.statSync(path.join(apiPath, f)).isDirectory());

// Middleware untuk memvalidasi API Key secara dinamis berdasarkan jenis endpoint (Free / Premium)
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

  // Deteksi jenis tingkatan endpoint saat ini secara otomatis
  let isPremiumEndpoint = false;
  try {
    for (const category of endpointDirs) {
      const files = fs.readdirSync(path.join(apiPath, category)).filter(f => f.endsWith('.js'));
      for (const file of files) {
        const routeName = file.replace(/\.js$/, "");
        if (req.path === `/${category}/${routeName}`) {
          const routeModule = require(path.join(apiPath, category, file));
          if (routeModule.type === 'premium') {
            isPremiumEndpoint = true;
          }
          break;
        }
      }
    }
  } catch (err) {
    console.error("Error matching endpoint type:", err);
  }

  // Validasi Berdasarkan Tingkat Akses (Free / Premium)
  if (isPremiumEndpoint) {
    if (!PREMIUM_API_KEYS.includes(userKey)) {
      return res.status(403).json({
        status: false,
        creator: "Arulz-XD",
        message: "Akses Ditolak! Endpoint ini khusus pengguna Premium. Silakan gunakan custom API Key Premium Anda."
      });
    }
  } else {
    // Jika endpoint free, apikey premium ataupun free tetap diperbolehkan masuk
    if (!FREE_API_KEYS.includes(userKey) && !PREMIUM_API_KEYS.includes(userKey)) {
      return res.status(403).json({
        status: false,
        creator: "Arulz-XD",
        message: "API Key salah / tidak valid! Silakan gunakan API Key Free yang terdaftar."
      });
    }
  }
  
  next();
};

// Pasang middleware validasi ke router API
router.use(validateApiKey);

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
  
  // Baca konfigurasi custom status ("ready"/"error") dan type ("free"/"premium") dari file router endpoint
  const endpointStatus = route.status || "ready";
  const endpointType = route.type || "free";

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
            if (match[1] !== 'apikey') params[match[1]] = "";
          });
          [...fnString.matchAll(/req\.body\.([a-zA-Z0-9_]+)/g)].forEach(match => {
            params[match[1]] = "";
          });
        });
      }
      endpoints.push({
        name: `/${category}/${file.replace(/\.js$/,"")}`,
        path: `/api/${category}/${file.replace(/\.js$/,"")}`,
        desc: `/${category}/${file.replace(/\.js$/,"")}`,
        status: endpointStatus,
        type: endpointType,
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

app.get('/script.js', (req, res) => { res.sendFile(path.join(__dirname, 'script.js')); });
app.get('/styles.css', (req, res) => { res.sendFile(path.join(__dirname, 'styles.css')); });

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
    #themeBg { transition: background-color 0.3s ease, background-image 0.3s ease; }
    body { transition: background 0.25s ease, color 0.25s ease; }
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
    .light-mode { color: #0f172a !important; }
    .light-mode #mainTitle { color: #0f172a !important; }
    .light-mode #mainDescription { color: #334155 !important; }
    .light-mode #stat-endpoints-title,
    .light-mode #stat-categories-title { color: #475569 !important; }
    .light-mode #siteFooter { color: #64748b !important; border-color: rgba(0,0,0,0.1); }
    .light-mode #no-results-title { color: #0f172a !important; }
    .light-mode .music-player-card { background: rgba(255, 255, 255, 0.85) !important; border-color: rgba(0, 0, 0, 0.12) !important; }
    .light-mode .music-text-title { color: #0f172a !important; }
    .light-mode .music-text-artist { color: #475569 !important; }
    .light-mode .music-progress-bar-bg { background-color: rgba(0,0,0,0.1) !important; }
    .light-mode .music-btn-nav { background-color: rgba(255, 255, 255, 0.9) !important; border-color: rgba(0,0,0,0.12) !important; color: #1e293b !important; }
    .light-mode .music-btn-nav:hover { background-color: #f1f5f9 !important; color: #0f172a !important; }
    
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
    .filter-btn:hover { background: rgba(255,255,255,0.15); }
    .filter-btn.active { background-color: #06b6d4 !important; color: #000000 !important; border-color: #06b6d4 !important; font-weight: bold; }
    .light-mode .filter-btn { border-color: rgba(0,0,0,0.15); background: rgba(0,0,0,0.04); color: #334155; }
    .light-mode .filter-btn:hover { background: rgba(0,0,0,0.08); }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
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

    <div id="bioDropdown" class="fixed top-0 right-0 h-full w-72 bg-[#08111e]/95 backdrop-blur-lg border-l border-white/10 transform translate-x-full transition-transform duration-300 ease-in-out z-50 shadow-2xl flex flex-col p-6 font-['Space_Grotesk'] light-mode:bg-white/95 light-mode:border-slate-200">
        <div class="flex items-center justify-between mb-6">
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
                        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 17.95a1 1 0 001.414 0l.707-.707a1 1 0 00-1.414-1.414l-.707.707a1 1 0 000 1.414zm2.12-14.14a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z"></path>
                    </svg>
                </button>
                <button id="closeMenuBtn" class="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-all light-mode:border-slate-200 light-mode:text-slate-500 light-mode:hover:bg-slate-100 light-mode:hover:text-slate-900">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
        
        <div class="flex-1 overflow-y-auto pr-1 space-y-6 scrollbar-hide">
            <div class="space-y-4">
                <div class="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-['JetBrains_Mono']">Owner Profile</div>
                <div class="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 light-mode:bg-slate-50 light-mode:border-slate-100">
                    <img src="${favicon}" alt="Owner avatar" class="w-10 h-10 rounded-lg object-cover border border-cyan-500/30">
                    <div>
                        <h4 class="text-xs font-bold text-slate-200 light-mode:text-slate-800">Arulz-XD</h4>
                        <p class="text-[10px] text-cyan-400 font-medium tracking-wide">Fullstack Developer</p>
                    </div>
                </div>
            </div>

            <div class="space-y-3">
                <div class="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-['JetBrains_Mono']">Social Media</div>
                <div class="grid grid-cols-1 gap-2 font-['JetBrains_Mono']">
                    <a href="https://github.com/arulzxd" target="_blank" class="social-badge">
                        <div class="px-4 py-2 rounded-xl text-xs font-bold transition-colors text-center border bg-slate-900/40 text-slate-200 hover:bg-slate-800/60 border-white/10">GITHUB</div>
                    </a>
                    <a href="https://instagram.com/arul_zxd" target="_blank" class="social-badge">
                        <div class="px-4 py-2 rounded-xl text-xs font-bold transition-colors text-center border bg-slate-900/40 text-slate-200 hover:bg-slate-800/60 border-white/10">INSTAGRAM</div>
                    </a>
                    <a href="https://wa.me/6283839524005" target="_blank" class="social-badge">
                        <div class="px-4 py-2 rounded-xl text-xs font-bold transition-colors text-center border bg-slate-900/40 text-slate-200 hover:bg-slate-800/60 border-white/10">WHATSAPP</div>
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div id="menuOverlay" class="fixed inset-0 bg-black/60 backdrop-blur-xs hidden z-40 transition-opacity duration-300"></div>

    <div class="max-w-6xl mx-auto px-4 py-12 relative z-10 font-['Space_Grotesk']">
        <header class="text-center mb-12">
            <h1 id="mainTitle" class="text-3xl font-bold tracking-tight mb-3 text-white flex items-center justify-center gap-3">
                ${headertitle}
            </h1>
            <p id="mainDescription" class="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                ${headerdescription}
            </p>
            
            <div id="timeBox" class="mt-4 inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/60 border border-white/10 text-xs font-['JetBrains_Mono'] shadow-sm light-mode:bg-slate-50 light-mode:border-slate-200/80">
                <span id="liveClock" class="font-bold text-cyan-400">00:00:00</span>
                <span class="text-slate-600">|</span>
                <span id="liveDate" class="text-slate-400 light-mode:text-slate-600">Loading Date...</span>
            </div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 items-start">
            <section class="lg:col-span-2 grid grid-cols-2 gap-4">
                <div class="glass-panel p-4 rounded-2xl flex flex-col justify-between min-h-[110px]">
                    <span id="stat-endpoints-title" class="text-[11px] font-bold text-slate-400 font-['JetBrains_Mono'] tracking-wider uppercase">Total Endpoint</span>
                    <div class="flex items-baseline gap-2 mt-2">
                        <span id="totalEndpoints" class="text-3xl font-bold text-cyan-400 tracking-tight font-['JetBrains_Mono']">0</span>
                        <span class="text-xs text-slate-500">items</span>
                    </div>
                </div>

                <div class="glass-panel p-4 rounded-2xl flex flex-col justify-between min-h-[110px]">
                    <span id="stat-categories-title" class="text-[11px] font-bold text-slate-400 font-['JetBrains_Mono'] tracking-wider uppercase">Total Kategori</span>
                    <div class="flex items-baseline gap-2 mt-2">
                        <span id="totalCategories" class="text-3xl font-bold text-purple-400 tracking-tight font-['JetBrains_Mono']">0</span>
                        <span class="text-xs text-slate-500">dirs</span>
                    </div>
                </div>
            </section>

            <section class="glass-panel p-4 rounded-2xl flex items-center justify-between music-player-card min-h-[110px]">
                <div class="flex items-center gap-3 w-full min-w-0">
                    <div class="relative group flex-shrink-0">
                        <img id="musicCover" src="${favicon}" alt="Music Cover" class="w-16 h-16 rounded-xl object-cover shadow-md border border-white/10 transition-transform duration-500 group-hover:scale-105">
                        <div id="musicLoadingSpinner" class="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center opacity-0 transition-opacity">
                            <svg class="animate-spin h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    </div>
                    
                    <div class="flex-1 min-w-0 pr-1 flex flex-col justify-between h-16">
                        <div class="leading-tight">
                            <h3 id="musicTitle" class="text-xs font-bold text-white truncate font-['Space_Grotesk'] music-text-title">Loading Playlist...</h3>
                            <p id="musicArtist" class="text-[10px] text-slate-400 truncate font-['JetBrains_Mono'] mt-0.5 music-text-artist">Please wait</p>
                        </div>
                        
                        <div class="w-full mt-2">
                            <div id="progressBarBg" class="w-full h-1 bg-white/10 rounded-full cursor-pointer relative music-progress-bar-bg" onclick="seekAudio(event)">
                                <div id="musicProgressBar" class="h-full bg-cyan-400 rounded-full width-0 transition-all duration-100"></div>
                            </div>
                            <div class="flex justify-between text-[8px] text-slate-500 font-['JetBrains_Mono'] mt-1">
                                <span id="musicCurrentTime">0:00</span>
                                <span id="musicDuration">0:00</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-1.5 ml-3 flex-shrink-0">
                    <button onclick="playNextMusic()" class="w-7 h-7 rounded-lg bg-slate-800/80 border border-white/10 text-slate-300 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all active:scale-95 music-btn-nav">
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                    </button>
                    <button id="playPauseBtn" onclick="togglePlayPause()" class="w-7 h-7 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center hover:bg-cyan-400 transition-all active:scale-95 shadow-md shadow-cyan-500/10">
                        <svg id="playIcon" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        <svg id="pauseIcon" class="w-3.5 h-3.5 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    </button>
                </div>
            </section>
        </div>

        <div class="glass-panel p-3 rounded-2xl mb-6">
            <div class="flex items-center gap-3 px-3 py-1 bg-black/20 rounded-xl border border-white/5 focus-within:border-cyan-500/40 transition-colors light-mode:bg-slate-50 light-mode:border-slate-200">
                <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" id="searchInput" placeholder="Cari endpoint berdasarkan nama, path, atau kategori..." class="w-full bg-transparent border-none outline-none text-xs py-2 text-slate-200 placeholder-slate-500 font-['Space_Grotesk'] focus:ring-0 light-mode:text-slate-800 light-mode:placeholder-slate-400" autocomplete="off" />
            </div>
        </div>

        <div id="categoryFilterBar" class="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide select-none">
            <button onclick="filterCategory('all')" id="cat-filter-all" class="filter-btn active">ALL</button>
        </div>

        <div id="noResults" class="hidden text-center py-16 glass-panel rounded-3xl border border-dashed border-white/10 max-w-md mx-auto transition-all animate-fadeIn">
            <div class="text-3xl mb-2">剥</div>
            <h3 id="no-results-title" class="text-sm font-bold mb-1 text-white">Endpoint tidak ditemukan</h3>
            <p id="no-results-desc" class="text-xs text-slate-400 light-mode:text-slate-500">Coba gunakan kata kunci lain</p>
        </div>

        <div id="apiList" class="space-y-4"></div>

        <footer id="siteFooter" class="mt-12 pt-6 border-t border-white/10 text-center text-xs text-slate-500">
            ${footer}
        </footer>
    </div>

    <div id="imageModal" class="fixed inset-0 bg-black/85 backdrop-blur-md hidden z-50 flex items-center justify-center p-4 cursor-zoom-out" onclick=\"closeImageModal()\">
        <img id="modalTargetImg" src="" alt="Response Zoomed View" class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl transition-all duration-300 scale-95 border border-white/10">
    </div>
    
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/locale/id.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.45/moment-timezone-with-data.min.js"></script>
<script>
    const playlistData = ${JSON.stringify(playlist)};
</script>
<script src="script.js"></script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Server is moving fast on port ${PORT}`);
});
