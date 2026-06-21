const BASE_URL = window.location.origin;
let isRequestInProgress = false;
let apiData = null;
let currentTheme = 'dark';
let currentLang = 'id';
let allApiElements = [];
let totalEndpoints = 0;
let totalCategories = 0;
let batteryMonitor = null;
let activeCategory = 'all';

// Pemetaan Ikon Kategori (SVG Kuning/Cyan)
const categoryIcons = {
    'ai': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1.27a2 2 0 0 1-1-1.73c0-1.1.9-2 2-2h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M9 13H7v2h2v-2m8 0h-2v2h2v-2M5 11h14a5 5 0 0 0-5-5h-4a5 5 0 0 0-5 5z"/></svg>',
    'downloader': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"/></svg>',
    'tools': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.3C.5 6.7.9 9.8 2.9 11.8c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.6z"/></svg>'
};

// 1. REALTIME WIDGET CLOCK LOGIC
function updateDigitalClock() {
    const clockEl = document.getElementById('digitalClock');
    const dateEl = document.getElementById('digitalDate');
    const sidebarTimeEl = document.getElementById('sidebarServerTime');
    
    if (typeof moment !== 'undefined') {
        const now = moment().tz("Asia/Jakarta");
        if (clockEl) clockEl.innerText = now.format("HH:mm:ss");
        if (dateEl) dateEl.innerText = now.format("ddd, DD MMM YYYY") + " - WIB";
        if (sidebarTimeEl) sidebarTimeEl.innerText = now.format("HH:mm");
    } else {
        const now = new Date();
        if (clockEl) clockEl.innerText = now.toLocaleTimeString('id-ID');
    }
}
setInterval(updateDigitalClock, 1000);

// 2. DEVICE BATTERY MONITORING LOGIC
function initBatteryMonitor() {
    const bar = document.getElementById('batteryLevelBar');
    const percent = document.getElementById('batteryPercent');
    const widget = document.getElementById('batteryWidget');

    if (navigator.getBattery) {
        navigator.getBattery().then(bat => {
            batteryMonitor = bat;
            if (widget) widget.classList.remove('hidden');
            
            function updateInfo() {
                const level = Math.round(bat.level * 100);
                if (percent) percent.innerText = `${level}%`;
                if (bar) {
                    bar.style.width = `${level}%`;
                    if (bat.charging) {
                        bar.className = "h-full bg-cyan-400 w-0 rounded-2xs animate-pulse";
                    } else if (level <= 20) {
                        bar.className = "h-full bg-rose-500 w-0 rounded-2xs";
                    } else {
                        bar.className = "h-full bg-emerald-500 w-0 rounded-2xs";
                    }
                }
            }
            updateInfo();
            bat.addEventListener('levelchange', updateInfo);
            bat.addEventListener('chargingchange', updateInfo);
        });
    }
}

// 3. SWITCH THEME MANAGEMENT
function toggleTheme() {
    const body = document.body;
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        currentTheme = 'dark';
    } else {
        body.classList.add('light-mode');
        currentTheme = 'light';
    }
}

// 4. GENERATE DAN RE-RENDER API CARDS MENU UTAMA
function loadApis() {
    const container = document.getElementById('apiList');
    const navContainer = document.getElementById('dynamicCategoryNav');
    if (!apiData || !container) return;

    container.innerHTML = '';
    if (navContainer) navContainer.innerHTML = '';
    allApiElements = [];
    totalEndpoints = 0;
    totalCategories = Object.keys(apiData).length;

    for (const categoryKey in apiData) {
        const category = apiData[categoryKey];
        
        const section = document.createElement('section');
        section.className = "mb-12 category-section";
        section.setAttribute('data-category', categoryKey);

        const iconHtml = categoryIcons[categoryKey] || '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>';

        section.innerHTML = `
            <div class="flex items-center space-x-3 mb-6 pb-2 border-b border-white/10 category-title-container">
                ${iconHtml}
                <h2 class="text-lg font-bold tracking-wider text-white uppercase">${category.name}</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 card-grid"></div>
        `;

        const grid = section.querySelector('.card-grid');

        category.endpoints.forEach(ep => {
            totalEndpoints++;
            const card = document.createElement('div');
            card.className = "bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:border-cyan-500/50 transition-all duration-300 relative flex flex-col justify-between group shadow-lg shadow-black/20 glow-effect";
            
            // Logika Menampilkan Badge Berdasarkan Type (Premium / Free)
            const isPremium = ep.type && ep.type.toLowerCase() === 'premium';
            const typeBadge = isPremium 
                ? `<span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border border-amber-300/30 shadow-sm shadow-amber-500/20">PREMIUM</span>`
                : `<span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">FREE</span>`;

            // Logika Menampilkan Badge Berdasarkan Status Scraper (Ready / Error / Perbaikan)
            const currentStatus = ep.status ? ep.status.toLowerCase() : 'ready';
            let statusBadge = '';
            if (currentStatus === 'ready') {
                statusBadge = `<span class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Active</span>`;
            } else if (currentStatus === 'perbaikan' || currentStatus === 'maintenance') {
                statusBadge = `<span class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Maintenance</span>`;
            } else {
                statusBadge = `<span class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">Error</span>`;
            }

            card.innerHTML = `
                <div>
                    <div class="flex items-center justify-between mb-3 gap-2">
                        <span class="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800/50 group-hover:bg-cyan-900 group-hover:text-cyan-300 transition-colors">${ep.method}</span>
                        <div class="flex items-center space-x-1.5">
                            ${typeBadge}
                            ${statusBadge}
                        </div>
                    </div>
                    <h3 class="font-mono font-bold text-slate-200 group-hover:text-cyan-400 transition-colors mb-1 tracking-tight break-all text-sm">${ep.path}</h3>
                    <p class="text-xs text-slate-400 font-sans leading-relaxed line-clamp-2 mb-4">${ep.description}</p>
                </div>
                <div class="pt-2 border-t border-white/5 flex items-center justify-between mt-auto">
                    <span class="text-[11px] font-mono text-slate-500">Params: ${ep.params.length > 0 ? ep.params.join(', ') : 'none'}</span>
                    <button class="text-xs font-bold text-cyan-400 group-hover:text-white bg-cyan-950/40 hover:bg-cyan-500 border border-cyan-800/30 hover:border-cyan-400 px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center space-x-1 open-test-btn">
                        <span>Open</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5"><path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08l4.158-3.92H3.75A.75.75 0 013 10z" clip-rule="evenodd" /></svg>
                    </button>
                </div>
            `;

            card.querySelector('.open-test-btn').addEventListener('click', () => {
                if (currentStatus !== 'ready') {
                    alert(`Gagal mengakses: Fitur ini sedang dalam status perbaikan/error (${currentStatus.toUpperCase()}).`);
                    return;
                }
                const testUrl = `${BASE_URL}${ep.path}${ep.params.length > 0 ? '?' + ep.params[0] + '=test' : ''}`;
                window.open(testUrl, '_blank');
            });

            grid.appendChild(card);
            allApiElements.push({
                element: card,
                path: ep.path.toLowerCase(),
                description: ep.description.toLowerCase(),
                category: categoryKey
            });
        });

        container.appendChild(section);

        if (navContainer) {
            const navBtn = document.createElement('button');
            navBtn.className = "w-full text-left px-4 py-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white font-medium border border-transparent transition-all flex items-center space-x-3 nav-category-btn";
            navBtn.setAttribute('data-target', categoryKey);
            navBtn.innerHTML = `
                <div class="w-2 h-2 rounded-full bg-slate-600 dynamic-dot"></div>
                <span class="capitalize text-xs tracking-wide">${categoryKey} Services</span>
            `;
            navContainer.appendChild(navBtn);
        }
    }

    const totalEndpointsEl = document.getElementById('totalEndpoints');
    const totalCategoriesEl = document.getElementById('totalCategories');
    if (totalEndpointsEl) totalEndpointsEl.innerText = totalEndpoints;
    if (totalCategoriesEl) totalCategoriesEl.innerText = totalCategories;

    initSidebarNavFilters();
}

// 5. EVENT FILTER CATEGORIES MANAGE
function initSidebarNavFilters() {
    const btns = document.querySelectorAll('.active-nav-btn, .nav-category-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => {
                b.classList.remove('bg-gradient-to-r', 'from-cyan-500/20', 'to-blue-500/20', 'text-cyan-400', 'border-cyan-500/30');
                b.classList.add('text-slate-400');
                const dot = b.querySelector('.dynamic-dot');
                if(dot) { dot.classList.remove('bg-cyan-400'); dot.classList.add('bg-slate-600'); }
            });

            btn.classList.remove('text-slate-400');
            btn.classList.add('bg-gradient-to-r', 'from-cyan-500/20', 'to-blue-500/20', 'text-cyan-400', 'border-cyan-500/30');
            const activeDot = btn.querySelector('.dynamic-dot');
            if(activeDot) { activeDot.classList.remove('bg-slate-600'); activeDot.classList.add('bg-cyan-400'); }

            activeCategory = btn.getAttribute('data-target');
            applyMainFiltering();
            
            if (window.innerWidth < 1024) {
                closeSidebarMenu();
            }
        });
    });
}

// 6. MAIN SYSTEM FILTERING
function applyMainFiltering() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.toLowerCase() : '';

    allApiElements.forEach(item => {
        const matchesSearch = item.path.includes(query) || item.description.includes(query);
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;

        if (matchesSearch && matchesCategory) {
            item.element.style.display = 'flex';
        } else {
            item.element.style.display = 'none';
        }
    });

    document.querySelectorAll('.category-section').forEach(sec => {
        const cards = sec.querySelectorAll('.card-grid > div');
        let totalVisible = 0;
        cards.forEach(c => { if(c.style.display !== 'none') totalVisible++; });
        sec.style.display = totalVisible > 0 ? 'block' : 'none';
    });
}

// 7. SIDEBAR TOGGLE OPACITY TRANSITION
const sidebarMenu = document.getElementById('sidebarMenu');
const menuOverlay = document.getElementById('menuOverlay');

function openSidebarMenu() {
    if(!sidebarMenu || !menuOverlay) return;
    menuOverlay.classList.remove('hidden');
    setTimeout(() => {
        menuOverlay.classList.add('opacity-100');
        sidebarMenu.classList.remove('translate-x-full');
    }, 10);
}

function closeSidebarMenu() {
    if(!sidebarMenu || !menuOverlay) return;
    sidebarMenu.classList.add('translate-x-full');
    menuOverlay.classList.remove('opacity-100');
    setTimeout(() => {
        menuOverlay.classList.add('hidden');
    }, 300);
}

// DOM CONTENT READY LISTENER INITIALIZER
document.addEventListener('DOMContentLoaded', () => {
    initBatteryMonitor();

    const menuToggleBtn = document.getElementById('menuToggle');
    const closeMenuBtn = document.getElementById('closeMenu');
    const searchInput = document.getElementById('searchInput');
    const themeToggleBtn = document.getElementById('themeToggle');

    if (menuToggleBtn) menuToggleBtn.addEventListener('click', openSidebarMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeSidebarMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', closeSidebarMenu);

    if (searchInput) {
        searchInput.addEventListener('input', applyMainFiltering);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    const avatarContainer = document.getElementById('avatarContainer');
    const bioDropdown = document.getElementById('bioDropdown');
    if (avatarContainer && bioDropdown) {
        avatarContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            if (bioDropdown.classList.contains('hidden')) {
                bioDropdown.classList.remove('hidden');
                setTimeout(() => {
                    bioDropdown.classList.remove('opacity-0', 'scale-95');
                    bioDropdown.classList.add('opacity-100', 'scale-100');
                }, 10);
            } else {
                bioDropdown.classList.remove('opacity-100', 'scale-100');
                bioDropdown.classList.add('opacity-0', 'scale-95');
                setTimeout(() => bioDropdown.classList.add('hidden'), 200);
            }
        });
        document.addEventListener('click', () => {
            bioDropdown.classList.remove('opacity-100', 'scale-100');
            bioDropdown.classList.add('opacity-0', 'scale-95');
            setTimeout(() => bioDropdown.classList.add('hidden'), 200);
        });
        bioDropdown.addEventListener('click', (e) => e.stopPropagation());
    }

    const heroLogo = document.getElementById('heroLogo');
    const zoomModal = document.getElementById('imageZoomModal');
    const zoomedImg = document.getElementById('zoomedImage');
    if (heroLogo && zoomModal && zoomedImg) {
        heroLogo.addEventListener('click', () => {
            zoomedImg.src = heroLogo.src;
            zoomModal.classList.remove('hidden');
            setTimeout(() => {
                zoomModal.classList.remove('opacity-0');
                zoomModal.classList.add('opacity-100');
                zoomedImg.classList.remove('scale-95');
                zoomedImg.classList.add('scale-100');
            }, 10);
        });
        zoomModal.addEventListener('click', () => {
            zoomModal.classList.remove('opacity-100');
            zoomModal.classList.add('opacity-0');
            zoomedImg.classList.remove('scale-100');
            zoomedImg.classList.add('scale-95');
            setTimeout(() => zoomModal.classList.add('hidden'), 300);
        });
    }

    fetch('/api/apilist')
        .then(res => res.json())
        .then(data => {
            apiData = data;
            loadApis();
        })
        .catch(err => {
            console.error(err);
            const container = document.getElementById('apiList');
            if(container) {
                container.innerHTML = `<div class="text-center p-8 bg-red-900/20 border border-red-700 rounded-lg"><div class="text-4xl mb-4">⚠️</div><h3 class="font-bold text-lg mb-2">Failed to load API data</h3></div>`;
            }
        });
});
