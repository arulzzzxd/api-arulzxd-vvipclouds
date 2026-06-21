const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== TRACKING TOTAL REQUEST / BULAN ====================\nlet totalRequestsThisMonth = 0;
// Menyimpan string bulan & tahun saat ini, contoh: "Jun 2026"
const getMonthYearString = () => {
  const d = new Date();
  return `${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;
};
let currentMonthString = getMonthYearString();

// Middleware Hitung Request Bulanan Secara Nyata
app.use((req, res, next) => {
  const thisMonth = getMonthYearString();
  if (thisMonth !== currentMonthString) {
    totalRequestsThisMonth = 0; // Reset jika sudah ganti bulan baru
    currentMonthString = thisMonth;
  }

  // Hanya menghitung hit pada rute API riil (mengabaikan dashboard, script, css, dsb)
  if (req.path.startsWith('/api') && req.path !== '/api/apilist') {
    totalRequestsThisMonth++;
  }

  next();
});
// =======================================================================

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
const footer = "© Arulz-XD";

// API KEY CONFIGURATION
const VALID_API_KEY = "arulzxd-keys";

// === KONFIGURASI PLAYLIST BANYAK MUSIK ===
const playlist = [
  {
    title: "PAMIT KERJO",
    artist: "NDX. AKA",
    url: "https://arulz-uploader.vercel.app/files/I9vj4v.mp3",
    cover: "https://arulz-uploader.vercel.app/files/SnhJe3.png"
  },
  {
    title: "BOJO KETIKUNG",
    artist: "NDX. AKA",
    url: "https://arulz-uploader.vercel.app/files/g3D6yT.mp3",
    cover: "https://arulz-uploader.vercel.app/files/SnhJe3.png"
  },
  {
    title: "TEKO LUNGO",
    artist: "NDX. AKA",
    url: "https://arulz-uploader.vercel.app/files/P0XmU9.mp3",
    cover: "https://arulz-uploader.vercel.app/files/SnhJe3.png"
  },
  {
    title: "TALING ASMORO",
    artist: "NDX. AKA",
    url: "https://arulz-uploader.vercel.app/files/e9V4D4.mp3",
    cover: "https://arulz-uploader.vercel.app/files/SnhJe3.png"
  },
  {
    title: "KIMCIL KEPOLEN",
    artist: "NDX. AKA",
    url: "https://arulz-uploader.vercel.app/files/j7hK8j.mp3",
    cover: "https://arulz-uploader.vercel.app/files/SnhJe3.png"
  }
];

// Helper function to read parameters from endpoints files
function getQueryParams(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/req\.query\.([a-zA-Z0-9_]+)/g);
    if (!match) return {};
    
    const params = {};
    match.forEach(p => {
      const pName = p.replace('req.query.', '');
      if (pName !== 'apikey') {
        params[pName] = `Masukkan nilai ${pName}`;
      }
    });
    params['apikey'] = "arulzxd-keys";
    return params;
  } catch (e) {
    return { "query": "Masukkan text...", "apikey": "arulzxd-keys" };
  }
}

// Function to recursively scan the /api/ routing folders
function getEndpointsFromRouter() {
  const categories = [];
  const apiDir = path.join(__dirname, 'api');
  
  if (!fs.existsSync(apiDir)) return categories;
  
  const folders = fs.readdirSync(apiDir);
  folders.forEach(folder => {
    const folderPath = path.join(apiDir, folder);
    if (fs.statSync(folderPath).isDirectory()) {
      const categoryData = {
        name: folder.toUpperCase(),
        items: []
      };
      
      const files = fs.readdirSync(folderPath);
      files.forEach(file => {
        if (file.endsWith('.js')) {
          const filePath = path.join(folderPath, file);
          const params = getQueryParams(filePath);
          
          categoryData.items.push({
            name: file.replace('.js', ''),
            path: `/api/${folder}/${file.replace('.js', '')}`,
            desc: `Ref: /${folder}/${file.replace('.js', '')}`,
            status: "ready",
            params: params,
            methods: ["GET"]
          });
        }
      });
      
      if (categoryData.items.length > 0) {
        categories.push(categoryData);
      }
    }
  });
  
  return categories;
}

// Dynamic injection mechanism to deliver UI
app.get('/', (req, res) => {
  const indexHtmlPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    return res.sendFile(indexHtmlPath);
  }

  const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="id">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link rel="icon" href="${favicon}" type="image/jpeg">
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="stylesheet" href="/styles.css">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.45/moment-timezone-with-data.min.js"></script>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-[#030712] text-slate-100 min-h-screen relative overflow-x-hidden font-['Plus_Jakarta+Sans'] pb-32">
      <div id="themeBg" class="fixed inset-0 -z-50 transition-all duration-300 bg-[#030712]"></div>
      
      <div id="toast" class="toast flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border border-white/10 text-xs font-semibold backdrop-blur-md">
          <svg id="toastIcon" class="w-5 h-5 fill-current flex-shrink-0 text-cyan-400" viewBox="0 0 20 20"></svg>
          <span id="toastMessage"></span>
      </div>

      <div class="max-w-4xl mx-auto px-4 pt-8 pb-12 relative z-10">
          
          <div class="flex justify-between items-center mb-8 bg-slate-900/30 border border-white/5 p-3 rounded-2xl backdrop-blur-md">
              <div class="flex items-center gap-2">
                  <button id="lang-id" onclick="setLanguage('id')" class="lang-btn active px-2.5 py-1 text-[10px] font-black tracking-widest rounded-lg border border-transparent uppercase font-mono transition-all">ID</button>
                  <button id="lang-en" onclick="setLanguage('en')" class="lang-btn px-2.5 py-1 text-[10px] font-black tracking-widest rounded-lg border border-transparent uppercase font-mono transition-all">EN</button>
              </div>
              <div class="flex items-center gap-3">
                  <button id="themeToggle" class="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors" title="Toggle Theme Mode">
                      <svg id="theme-toggle-dark-icon" class="w-4 h-4 hidden" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8 8 0 1010.586 10.586z"></path></svg>
                      <svg id="theme-toggle-light-icon" class="w-4 h-4 hidden" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clip-rule="evenodd"></path></svg>
                  </button>
                  <button id="bioMenuBtn" class="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-all active:scale-95 shadow-lg shadow-cyan-500/5 font-bold text-xs flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-green-400 animate-ping"></span> OWNER
                  </button>
              </div>
          </div>

          <div id="menuOverlay" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 hidden transition-opacity duration-300"></div>
          <div id="bioDropdown" class="fixed right-0 top-0 h-screen w-80 bg-slate-950/95 border-l border-white/10 z-50 p-6 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out transform translate-x-full backdrop-blur-lg">
              <div>
                  <div class="flex justify-between items-center mb-6">
                      <h3 class="text-sm font-black tracking-widest text-cyan-400 font-['Space_Grotesk'] uppercase">CREATOR PROFILE</h3>
                      <button id="closeMenuBtn" class="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                  </div>
                  <div class="text-center bg-white/5 rounded-2xl p-5 border border-white/5 backdrop-blur-sm">
                      <div class="w-20 h-20 mx-auto rounded-2xl overflow-hidden border-2 border-cyan-500/30 p-1 mb-3 bg-slate-900 shadow-xl shadow-cyan-500/10">
                          <img src="${logo}" alt="Creator Logo" class="w-full h-full object-cover rounded-xl">
                      </div>
                      <h4 class="font-extrabold text-md tracking-wide text-white">Arulz-XD</h4>
                      <p class="text-[11px] text-cyan-400 font-mono tracking-widest mt-0.5 uppercase">Fullstack Developer</p>
                      <p class="text-xs text-slate-400 mt-3 font-medium leading-relaxed">Selamat datang di layanan Rest API gratis kami. Dikembangkan dengan dedikasi penuh untuk performa cepat dan andal.</p>
                  </div>
              </div>
              <div class="space-y-2.5 social-badge">
                  <a href="https://github.com/ArulzXD" target="_blank" class="block"><div class="px-4 py-2 rounded-xl text-xs font-bold transition-colors text-center border bg-slate-900/40 text-slate-200 hover:bg-slate-800/60 border-white/10">GITHUB REPOSITORY</div></a>
                  <a href="https://whatsapp.com/channel/0029VaoN67u6rsQvR9orP31v" target="_blank" class="block"><div class="px-4 py-2 rounded-xl text-xs font-bold transition-colors text-center border bg-slate-900/40 text-slate-200 hover:bg-slate-800/60 border-white/10">WHATSAPP CHANNEL</div></a>
                  <a href="https://wa.me/6283122143448" target="_blank" class="block"><div class="px-4 py-2 rounded-xl text-xs font-bold transition-colors text-center border bg-slate-900/40 text-slate-200 hover:bg-slate-800/60 border-white/10">CHAT VIA WHATSAPP</div></a>
              </div>
          </div>

          <header class="text-center mb-10">
              <div class="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 shadow-inner">
                  <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span class="text-[10px] font-black uppercase tracking-widest text-cyan-400 font-mono">v2.5 Production-Ready</span>
              </div>
              <div class="h-12 flex items-center justify-center overflow-hidden mb-2">${headertitle}</div>
              <p class="text-xs text-slate-400 light-mode:text-slate-500 max-w-md mx-auto leading-relaxed font-medium">${headerdescription}</p>
          </header>

          <section class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div class="stats-card glass-panel rounded-2xl p-4 flex items-center gap-4 shadow-xl border relative overflow-hidden">
                  <div class="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0 text-cyan-400 border border-cyan-500/20 light-mode:bg-cyan-100">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                  <div class="text-left min-w-0">
                      <p id="stat-requests-title" class="text-[10px] font-black text-slate-400 light-mode:text-slate-500 uppercase tracking-widest truncate">TOTAL REQUESTS</p>
                      <h3 id="totalRequests" class="text-lg font-black text-white font-['Space_Grotesk'] mt-0.5">0</h3>
                  </div>
              </div>
              <div class="stats-card glass-panel rounded-2xl p-4 flex items-center gap-4 shadow-xl border relative overflow-hidden">
                  <div class="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0 text-cyan-400 border border-cyan-500/20 light-mode:bg-cyan-100">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                  </div>
                  <div class="text-left min-w-0">
                      <p id="stat-endpoints-title" class="text-[10px] font-black text-slate-400 light-mode:text-slate-500 uppercase tracking-widest truncate">Total Endpoint</p>
                      <h3 id="totalEndpoints" class="text-lg font-black text-white font-['Space_Grotesk'] mt-0.5">0</h3>
                  </div>
              </div>
              <div class="stats-card glass-panel rounded-2xl p-4 flex items-center gap-4 shadow-xl border relative overflow-hidden">
                  <div class="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0 text-cyan-400 border border-cyan-500/20 light-mode:bg-cyan-100">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                  </div>
                  <div class="text-left min-w-0">
                      <p id="stat-categories-title" class="text-[10px] font-black text-slate-400 light-mode:text-slate-500 uppercase tracking-widest truncate">Total Kategori</p>
                      <h3 id="totalCategories" class="text-lg font-black text-white font-['Space_Grotesk'] mt-0.5">0</h3>
                  </div>
              </div>
          </section>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div class="glass-panel border rounded-2xl p-4 flex items-center justify-between shadow-xl">
                  <div class="flex items-center gap-3 text-left">
                      <div class="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      </div>
                      <div>
                          <p id="liveClock" class="text-sm font-extrabold text-white font-mono tracking-wider">00:00:00</p>
                          <p id="liveDate" class="text-[10px] font-bold text-slate-400 light-mode:text-slate-500 uppercase tracking-widest mt-0.5">Mendeteksi Tanggal...</p>
                      </div>
                  </div>
                  <div class="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-black uppercase tracking-widest font-mono">WIB TIME</div>
              </div>
              <div id="batteryContainer" class="glass-panel border rounded-2xl p-4 flex flex-col justify-between shadow-xl text-left relative overflow-hidden">
                  <div class="flex items-center justify-between w-full z-10">
                      <div class="flex items-center gap-3">
                          <div class="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z"/></svg>
                          </div>
                          <div>
                              <p id="stat-battery-title" class="text-[10px] font-black text-slate-400 light-mode:text-slate-500 uppercase tracking-widest">Baterai Anda</p>
                              <p id="batteryStatus" class="text-[10px] font-bold text-slate-300 light-mode:text-slate-600 mt-0.5 uppercase tracking-wider">Mendeteksi...</p>
                          </div>
                      </div>
                      <h3 id="batteryPercentage" class="text-md font-black text-white font-mono">--%</h3>
                  </div>
                  <div class="w-full bg-white/5 light-mode:bg-black/5 h-1.5 rounded-full mt-3 overflow-hidden border border-white/5">
                      <div id="batteryLevel" class="battery-level bg-cyan-400 h-full w-0 transition-all duration-500 rounded-full"></div>
                  </div>
              </div>
          </div>

          <div class="glass-panel border rounded-2xl p-4 md:p-5 shadow-xl mb-8 text-left relative overflow-hidden">
              <audio id="audioElement" preload="auto"></audio>
              <div class="flex flex-col md:flex-row items-center gap-4 justify-between w-full">
                  <div class="flex items-center gap-4 w-full md:w-auto min-w-0">
                      <div class="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-slate-900 border border-white/10 overflow-hidden shadow-2xl flex-shrink-0 relative group">
                          <img id="musicCoverImg" src="${logo}" alt="Cover Music" class="w-full h-full object-cover transition-transform duration-700">
                          <div class="absolute inset-0 bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                          </div>
                      </div>
                      <div class="min-w-0 text-left flex-1">
                          <h4 id="musicTitle" class="font-extrabold text-sm text-white tracking-wide truncate">Loading Track...</h4>
                          <p id="musicArtist" class="text-[11px] text-cyan-400 font-mono tracking-widest mt-0.5 truncate uppercase">ARTIST</p>
                          <div class="flex items-center gap-2 mt-2">
                              <span id="currentTime" class="text-[9px] font-mono text-slate-400 light-mode:text-slate-500">0:00</span>
                              <div id="progressContainer" class="flex-1 max-w-[180px] bg-white/5 light-mode:bg-black/5 h-1 rounded-full cursor-pointer relative border border-white/5">
                                  <div id="progressBar" class="bg-cyan-400 h-full w-0 rounded-full transition-all duration-100"></div>
                              </div>
                              <span id="totalDuration" class="text-[9px] font-mono text-slate-400 light-mode:text-slate-500">0:00</span>
                          </div>
                      </div>
                  </div>
                  <div class="flex items-center gap-2 w-full md:w-auto justify-end mt-2 md:mt-0 flex-shrink-0">
                      <button id="prevBtn" class="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-slate-300 transition-all active:scale-90" title="Previous Song">
                          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                      </button>
                      <button id="playBtn" class="p-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all active:scale-90 shadow-lg shadow-cyan-500/10" title="Play / Pause">
                          <svg id="playIcon" class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </button>
                      <button id="nextBtn" class="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-slate-300 transition-all active:scale-90" title="Next Song">
                          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                      </button>
                      <button id="playlistToggleBtn" class="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-cyan-400 border-cyan-500/10 hover:border-cyan-500/30 transition-all active:scale-90 ml-1" title="Show Playlist">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                      </button>
                  </div>
              </div>
              <div id="playlistPanel" class="hidden mt-4 pt-3 border-t border-white/5 max-h-40 overflow-y-auto space-y-1.5 pr-1"></div>
          </div>

          <div class="mb-6 space-y-4">
              <div class="relative">
                  <input type="text" id="searchInput" class="w-full px-5 py-4 pl-12 rounded-2xl bg-slate-900/40 light-mode:bg-white border border-white/10 light-mode:border-slate-300 text-white light-mode:text-slate-900 focus:outline-none focus:border-cyan-500 font-medium text-sm transition-all shadow-xl backdrop-blur-md" placeholder="Cari endpoint berdasarkan nama, path, atau kategori...">
                  <svg class="absolute left-4 top-4 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
              </div>
              <div id="categoryFilters" class="flex flex-wrap gap-2 mt-4 justify-start md:justify-center overflow-x-auto pb-2 scrollbar-hide"></div>
          </div>

          <div id="noResults" class="text-center py-12 hidden">
              <div class="text-4xl mb-2">🔍</div>
              <h3 id="no-results-title" class="text-sm font-bold mb-1 text-white">Endpoint tidak ditemukan</h3>
              <p id="no-results-desc" class="text-xs text-slate-400 light-mode:text-slate-500">Coba gunakan kata kunci lain</p>
          </div>

          <div id="apiList" class="space-y-4"></div>

          <footer id="siteFooter" class="mt-12 pt-6 border-t border-white/10 text-center text-xs text-slate-500">
              ${footer}
          </footer>
      </div>
      
  <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js"></script>\n  <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/locale/id.min.js"></script>\n  <script src="https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.45/moment-timezone-with-data.min.js"></script>
  <script src="/script.js"></script>
  </body>
  </html>`;
  
  res.send(htmlTemplate);
});

// ROUTE UNTUK DATA API LIST YANG DIKIRIM KE DASHBOARD FRONTEND\napp.get('/api/apilist', (req, res) => {
  const categories = getEndpointsFromRouter();
  res.json({
    categories: categories,
    // FIX: Mengirim totalRequestsThisMonth agar total request sinkron & terus bertambah
    totalRequestsToday: totalRequestsThisMonth, 
    musicPlaylist: playlist
  });
});

// Dynamic mounting system for modular endpoints loader
const apiDir = path.join(__dirname, 'api');
if (fs.existsSync(apiDir)) {
  const folders = fs.readdirSync(apiDir);
  folders.forEach(folder => {
    const folderPath = path.join(apiDir, folder);
    if (fs.statSync(folderPath).isDirectory()) {
      const files = fs.readdirSync(folderPath);
      files.forEach(file => {
        if (file.endsWith('.js')) {
          const routePath = `/api/${folder}/${file.replace('.js', '')}`;
          try {
            const routeHandler = require(path.join(folderPath, file));
            if (typeof routeHandler === 'function') {
              app.use(routePath, routeHandler);
            }
          } catch (e) {
            console.error(`Gagal memuat endpoint route ${routePath}:`, e.message);
          }
        }
      });
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server is running beautifully on port ${PORT}`);
});