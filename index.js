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
const VALID_API_KEY = "arulzxd-keys"; // API Key Free
const PREMIUM_API_KEY = "arulzxd-premium"; // API Key Premium tetap rahasia di backend

// Ambil list folder di dalam direktori 'api' untuk dijadikan kategori secara dinamis
const apiDir = path.join(__dirname, 'api');
let apiData = {};

if (fs.existsSync(apiDir)) {
    const categories = fs.readdirSync(apiDir);
    categories.forEach(category => {
        const categoryPath = path.join(apiDir, category);
        if (fs.statSync(categoryPath).isDirectory()) {
            const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
            if (files.length > 0) {
                apiData[category] = {
                    name: category.charAt(0).toUpperCase() + category.slice(1) + " Features",
                    endpoints: []
                };
                files.forEach(file => {
                    try {
                        const router = require(path.join(categoryPath, file));
                        app.use(router);

                        if (router.stack) {
                            router.stack.forEach(layer => {
                                if (layer.route) {
                                    const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
                                    
                                    // Membaca settingan rahasia dari router (Sesuai cara setting yang kamu minta)
                                    apiData[category].endpoints.push({
                                        path: layer.route.path,
                                        method: methods,
                                        params: router.params || [],
                                        description: router.description || `Endpoint untuk layanan ${category}`,
                                        type: router.type || "free",      // Membaca router.type (free/premium)
                                        status: router.status || "ready"  // Membaca router.status (ready/error/perbaikan)
                                    });
                                }
                            });
                        }
                    } catch (e) {
                        console.error(`Gagal memuat router ${file}:`, e);
                    }
                });
            }
        }
    });
}

// Endpoint JSON List - Premium API Key TIDAK ditaruh di sini demi keamanan
app.get('/api/apilist', (req, res) => {
    res.json(apiData);
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="icon" href="${favicon}" type="image/jpeg">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', sans-serif; }
        /* Animasi Glow */
        .glow-effect:hover {
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.15);
            border-color: rgba(6, 182, 212, 0.4);
        }
        /* Mode Terang Global */
        .light-mode {
            background-color: #f8fafc !important;
            color: #0f172a !important;
        }
        .light-mode .bg-slate-950 { background-color: #ffffff !important; }
        .light-mode .bg-slate-900\\/40 { background-color: #f1f5f9 !important; border-color: #cbd5e1 !important; }
        .light-mode .text-slate-400 { color: #475569 !important; }
        .light-mode .text-white { color: #0f172a !important; }
        .light-mode .border-white\\/10 { border-color: #e2e8f0 !important; }
        .light-mode .bg-cyan-950 { background-color: #ecfeff !important; color: #0891b2 !important; border-color: #cffafe !important; }
        .light-mode #sidebarMenu { background-color: rgba(255, 255, 255, 0.8) !important; border-color: #e2e8f0 !important; }
        .light-mode #bioDropdown { background-color: #ffffff !important; border-color: #e2e8f0 !important; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-300">

    <div class="fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>
    <div class="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 relative z-10">
        
        <header class="flex items-center justify-between mb-12 pb-6 border-b border-white/10">
            <div class="flex items-center space-x-4 relative">
                <div class="relative group cursor-pointer" id="avatarContainer">
                    <div class="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
                    <img id="avatarImage" src="${logo}" alt="Logo" class="relative w-14 h-14 rounded-full border-2 border-slate-950 object-cover transform group-hover:scale-105 transition duration-300">
                </div>
                <div>
                    <h1 id="profileName" class="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                        ArulzXD
                        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Server Online"></span>
                    </h1>
                    <p id="profileRole" class="text-xs text-slate-400 font-medium">Fullstack Web Developer</p>
                </div>

                <div id="bioDropdown" class="absolute top-16 left-0 w-72 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl hidden z-50 transform origin-top-left transition-all duration-200 opacity-0 scale-95">
                    <div class="flex flex-col items-center text-center">
                        <img src="${logo}" alt="Profile" class="w-20 h-20 rounded-full border-2 border-cyan-500/30 object-cover mb-3 shadow-lg">
                        <h4 class="font-bold text-white text-base">Idzharul Haqqi W.P.L</h4>
                        <p class="text-xs text-cyan-400 font-mono mb-4">@ArulzXD</p>
                        <p class="text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3 w-full">
                            Siswa TJKT yang berfokus pada pengembangan Backend API, automasi web scraping, dan pengelolaan server cloud.
                        </p>
                        <div class="w-full grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-400">
                            <div class="bg-white/5 p-2 rounded-lg text-center">
                                <span class="block text-slate-500">Status</span>
                                <span class="text-emerald-400 font-bold">Active</span>
                            </div>
                            <div class="bg-white/5 p-2 rounded-lg text-center">
                                <span class="block text-slate-500">Region</span>
                                <span class="text-white">Indonesia</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex items-center space-x-3">
                <div class="hidden sm:flex flex-col items-end px-3 py-1.5 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl font-mono text-xs">
                    <span id="digitalClock" class="text-cyan-400 font-bold tracking-wider">00:00:00</span>
                    <span id="digitalDate" class="text-[9px] text-slate-500 uppercase tracking-tight">WIB / GMT+7</span>
                </div>

                <div id="batteryWidget" class="hidden md:flex items-center space-x-2 px-3 py-2 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl font-mono text-[11px] text-slate-400">
                    <div class="relative w-6 h-3.5 border border-slate-500 rounded-sm p-0.5 flex items-center">
                        <div id="batteryLevelBar" class="h-full bg-emerald-500 w-0 rounded-2xs"></div>
                        <div class="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[2px] h-1.5 bg-slate-500 rounded-r-2xs"></div>
                    </div>
                    <span id="batteryPercent">--%</span>
                </div>

                <button id="themeToggle" class="p-2.5 bg-slate-900/50 hover:bg-slate-900 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all shadow-md" title="Ganti Tema">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m0 13.5V21M5.22 5.22l1.58 1.58m10.42 10.42l1.58 1.58M3 12h2.25m13.5 0H21M5.22 19.78l1.58-1.58M17.58 5.22l1.58 1.58M12 15a3 3 0 100-6 3 3 0 000 6z" /></svg>
                </button>

                <button id="menuToggle" class="p-2.5 bg-slate-900/50 hover:bg-slate-900 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all shadow-md" title="Buka Menu">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                </button>
            </div>
        </header>

        <div id="menuOverlay" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 hidden opacity-0 transition-opacity duration-300"></div>
        <aside id="sidebarMenu" class="fixed top-0 right-0 h-full w-80 bg-slate-900/90 backdrop-blur-2xl border-l border-white/10 p-6 shadow-2xl z-50 transform translate-x-full transition-transform duration-300 ease-in-out flex flex-col justify-between">
            <div>
                <div class="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                    <h3 class="font-bold text-lg text-white tracking-wide uppercase">Navigation</h3>
                    <button id="closeMenu" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div class="grid grid-cols-2 gap-3 mb-8">
                    <div class="bg-white/5 border border-white/5 p-3 rounded-xl">
                        <span class="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Total API</span>
                        <span id="totalEndpoints" class="text-xl font-bold font-mono text-cyan-400">0</span>
                    </div>
                    <div class="bg-white/5 border border-white/5 p-3 rounded-xl">
                        <span class="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Kategori</span>
                        <span id="totalCategories" class="text-xl font-bold font-mono text-blue-400">0</span>
                    </div>
                </div>

                <nav class="space-y-2">
                    <button class="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 font-medium border border-cyan-500/30 flex items-center space-x-3 active-nav-btn" data-target="all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
                        <span>Semua Fitur API</span>
                    </button>
                    <div id="dynamicCategoryNav" class="space-y-1.5 pt-2 border-t border-white/5"></div>
                </nav>
            </div>

            <div class="border-t border-white/10 pt-4 text-center">
                <span class="text-xs text-slate-500 font-mono">Server Time: <span id="sidebarServerTime" class="text-slate-400">00:00</span></span>
            </div>
        </aside>

        <section class="text-center mb-12 relative">
            <div class="mb-4 inline-block relative group">
                <div class="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                <img src="${logo}" alt="Large Logo" id="heroLogo" class="relative w-24 h-24 mx-auto rounded-2xl border border-white/10 shadow-xl cursor-zoom-in transition-transform duration-300 hover:scale-[1.02]">
            </div>
            <h2 id="siteHeaderTitle" class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl mb-3 font-sans uppercase">
                ${headertitle}
            </h2>
            <p id="siteHeaderDesc" class="max-w-xl mx-auto text-sm text-slate-400 font-medium leading-relaxed">
                ${headerdescription}
            </p>
        </section>

        <section class="max-w-2xl mx-auto mb-16 relative">
            <div class="relative rounded-2xl bg-slate-900/50 backdrop-blur-md border border-white/10 p-2 shadow-xl flex items-center group focus-within:border-cyan-500/50 transition-all duration-300">
                <div class="pl-3 pr-2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.603 10.602z" /></svg>
                </div>
                <input type="text" id="searchInput" placeholder="Cari endpoint url atau kata kunci layanan api..." class="w-full bg-transparent border-none outline-none py-2.5 px-2 text-sm text-white placeholder-slate-500 font-sans">
                <div class="pr-2 hidden sm:block">
                    <span class="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono text-slate-500 uppercase tracking-wider">Search</span>
                </div>
            </div>
        </section>

        <main id="apiList" class="space-y-12">
            <div class="text-center py-20 space-y-4">
                <div class="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p class="text-xs text-slate-500 font-mono tracking-widest uppercase animate-pulse">Menghubungkan ke server database...</p>
            </div>
        </main>

        <footer id="siteFooter" class="mt-12 pt-6 border-t border-white/10 text-center text-xs text-slate-500">
            ${footer}
        </footer>
    </div>

    <div id="imageZoomModal" class="fixed inset-0 bg-black/90 z-[100] hidden flex items-center justify-center p-4 cursor-zoom-out opacity-0 transition-opacity duration-300">
        <div class="relative max-w-4xl max-h-[85vh] flex items-center justify-center">
            <img id="zoomedImage" src="" alt="Zoomed Preview" class="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10 transform scale-95 transition-transform duration-300">
            <button class="absolute -top-12 right-0 text-slate-400 hover:text-white bg-slate-900/80 border border-white/10 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider font-sans">
                Close ✕
            </button>
        </div>
    </div>
    
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.45/moment-timezone-with-data.min.js"></script>
<script src="/script.js"></script>
</body>
</html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
