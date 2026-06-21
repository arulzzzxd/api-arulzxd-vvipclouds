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

const themeToggleBtn = document.getElementById('themeToggle');
const body = document.body;
const themeBg = document.getElementById('themeBg');

// Pemetaan Ikon Kategori (SVG Kuning/Cyan)
const categoryIcons = {
    'ai': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 1 1 12 2zm-2 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm4 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>',
    'download': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M12 16l-5-5h3V4h4v7h3l-5 5zm9 4H3v-2h18v2z"/></svg>',
    'search': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
    'image': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
    'tools': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.1L9 6 6 9 1.8 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>',
    'maker': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
    'stalker': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
    'canvas': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',
    'security': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>',
    'news': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 16H5V5h14v14zm-9-2h8v-2h-8v2zm0-4h8v-2h-8v2zm0-4h8V7h-8v2zm-4 8h2v-8H6v8z"/></svg>',
    'random': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>',
    'islam': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>',
    'default': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>'
};

const i18n = {
    id: {
        searchPlaceholder: "Cari endpoint berdasarkan nama, path, atau kategori...",
        noResultsTitle: "Endpoint tidak ditemukan",
        noResultsDesc: "Coba gunakan kata kunci lain",
        endpointsTitle: "Total Endpoint",
        categoriesTitle: "Total Kategori",
        requestsTitle: "Total Hit Request",
        endpointsCount: "endpoints",
        btnExecute: "Eksekusi",
        btnClear: "Bersihkan",
        toastMediaCopy: "Media URL disalin ke papan klip!",
        toastMediaFail: "Gagal menyalin URL",
        endpointNotAvailable: "⚠️ Endpoint ini sedang mengalami gangguan/error",
        toastRequestWait: "Harap tunggu permintaan saat ini selesai",
        toastRequestSuccess: "Permintaan berhasil diselesaikan!",
        toastRequestFailed: "Permintaan gagal!"
    },
    en: {
        searchPlaceholder: "Search endpoints by name, path, or category...",
        noResultsTitle: "No endpoints found",
        noResultsDesc: "Try a different search term",
        endpointsTitle: "Total Endpoints",
        categoriesTitle: "Total Categories",
        requestsTitle: "Total Hit Requests",
        endpointsCount: "endpoints",
        btnExecute: "Execute",
        btnClear: "Clear",
        toastMediaCopy: "Media URL copied to clipboard!",
        toastMediaFail: "Failed to copy URL",
        endpointNotAvailable: "⚠️ This endpoint is currently experiencing errors",
        toastRequestWait: "Please wait for current request",
        toastRequestSuccess: "Request completed successfully!",
        toastRequestFailed: "Request failed!"
    }
};

function updateThemeBackground(theme) {
    if (themeBg) {
        themeBg.className = "fixed inset-0 -z-50 transition-all duration-300";
        if (theme === 'light') {
            document.body.style.backgroundColor = "#ffffff";
            themeBg.style.backgroundColor = "#ffffff";
            themeBg.style.backgroundImage = "radial-gradient(#cbd5e1 1.5px, transparent 1.5px)";
            themeBg.style.backgroundSize = "24px 24px";
        } else {
            document.body.style.backgroundColor = "#030712";
            themeBg.style.backgroundColor = "#030712";
            themeBg.style.backgroundImage = "radial-gradient(rgba(255, 255, 255, 0.12) 1.5px, transparent 1.5px)";
            themeBg.style.backgroundSize = "24px 24px";
        }
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    currentTheme = savedTheme;

    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        body.classList.remove('text-slate-100');
        body.classList.add('text-slate-900');
        themeToggleDarkIcon?.classList.add('hidden');
        themeToggleLightIcon?.classList.remove('hidden');
    } else {
        body.classList.remove('light-mode');
        body.classList.remove('text-slate-900');
        body.classList.add('text-slate-100');
        themeToggleDarkIcon?.classList.remove('hidden');
        themeToggleLightIcon?.classList.add('hidden');
    }
    updateThemeBackground(currentTheme);
    updateSocialBadges();
}

function toggleTheme() {
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.remove('text-slate-900');
        body.classList.add('text-slate-100');
        themeToggleDarkIcon?.classList.remove('hidden');
        themeToggleLightIcon?.classList.add('hidden');
        currentTheme = 'dark';
    } else {
        body.classList.add('light-mode');
        body.classList.remove('text-slate-100');
        body.classList.add('text-slate-900');
        themeToggleDarkIcon?.classList.add('hidden');
        themeToggleLightIcon?.classList.remove('hidden');
        currentTheme = 'light';
    }

    localStorage.setItem('theme', currentTheme);
    updateThemeBackground(currentTheme);
    updateSocialBadges();
    if (apiData) loadApis();
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    document.getElementById('lang-id').classList.toggle('active', lang === 'id');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');

    document.getElementById('searchInput').placeholder = i18n[lang].searchPlaceholder;
    document.getElementById('no-results-title').textContent = i18n[lang].noResultsTitle;
    document.getElementById('no-results-desc').textContent = i18n[lang].noResultsDesc;
    document.getElementById('stat-endpoints-title').textContent = i18n[lang].endpointsTitle;
    document.getElementById('stat-categories-title').textContent = i18n[lang].categoriesTitle;
    document.getElementById('stat-requests-title').textContent = i18n[lang].requestsTitle;

    const dateElement = document.getElementById('liveDate');
    if (dateElement && typeof moment !== 'undefined') {
        const now = moment().tz("Asia/Jakarta");
        dateElement.textContent = now.locale('id').format('dddd, D MMMM YYYY');
    }

    if (apiData) loadApis();
}

function updateSocialBadges() {
    const isLightMode = body.classList.contains('light-mode');
    const socialBadges = document.querySelectorAll('.social-badge > div');

    socialBadges.forEach(badge => {
        if (isLightMode) {
            badge.className = 'px-4 py-2 rounded-xl text-xs font-bold transition-colors text-center border bg-white/80 text-slate-900 hover:bg-slate-100 border-black/10 shadow-sm';
        } else {
            badge.className = 'px-4 py-2 rounded-xl text-xs font-bold transition-colors text-center border bg-slate-900/40 text-slate-200 hover:bg-slate-800/60 border-white/10';
        }
    });
}

function initDigitalClock() {
    const clockElement = document.getElementById('liveClock');
    const dateElement = document.getElementById('liveDate');

    if (!clockElement || !dateElement) return;

    function updateClock() {
        if (typeof moment === 'undefined') return;

        const now = moment().tz("Asia/Jakarta");
        clockElement.textContent = now.format('HH:mm:ss');
        dateElement.textContent = now.locale('id').format('dddd, D MMMM YYYY');
    }

    updateClock();
    setInterval(updateClock, 1000);
}

function updateTotalEndpoints() { document.getElementById('totalEndpoints').textContent = totalEndpoints; }
function updateTotalCategories() { document.getElementById('totalCategories').textContent = totalCategories; }

function updateMonthlyRequests(count = 0) {
    const reqEl = document.getElementById('totalRequests');
    if (reqEl) {
        reqEl.textContent = count.toLocaleString('id-ID');
    }
}

function fetchStats() {
    fetch('/api/stats')
        .then(res => res.json())
        .then(data => {
            if (data && typeof data.totalRequests !== 'undefined') {
                updateMonthlyRequests(data.totalRequests);
            }
        })
        .catch(err => console.error("Gagal memuat statistik database:", err));
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    toastMessage.textContent = message;
    if (isError) {
        toastIcon.innerHTML = '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>';
    } else {
        toastIcon.innerHTML = '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>';
    }
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function copyText(text, type = 'path') {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`${type} berhasil disalin ke papan klip!`);
    }).catch(() => {
        showToast('Gagal menyalin text', true);
    });
}

function copyFromElement(elementId, type) {
    const el = document.getElementById(elementId);
    if (el) {
        copyText(el.innerText || el.textContent, type);
    }
}

function updateLivePreview(catIdx, epIdx, method, basePath) {
    const form = document.getElementById(`form-${catIdx}-${epIdx}`);
    if (!form) return;

    const formData = new FormData(form);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
        if (value) params.append(key, value);
    }

    const queryStr = params.toString();
    const finalUrl = queryStr ? `${BASE_URL}${basePath}?${queryStr}` : `${BASE_URL}${basePath}`;

    const urlContainer = document.getElementById(`live-url-${catIdx}-${epIdx}`);
    const curlContainer = document.getElementById(`live-curl-${catIdx}-${epIdx}`);

    if (urlContainer) urlContainer.textContent = finalUrl;
    if (curlContainer) {
        if (method === 'GET') {
            curlContainer.textContent = `curl -X GET "${finalUrl}"`;
        } else {
            const bodyParams = [];
            for (const [key, value] of formData.entries()) {
                if (value) bodyParams.push(`"${key}": "${value}"`);
            }
            const dataString = bodyParams.length ? ` -H "Content-Type: application/json" -d '{${bodyParams.join(', ')}}'` : '';
            curlContainer.textContent = `curl -X ${method} "${BASE_URL}${basePath}"${dataString}`;
        }
    }
}

function toggleCategory(index) {
    const content = document.getElementById(`cat-${index}`);
    const icon = document.getElementById(`cat-icon-${index}`);
    content.classList.toggle('hidden');
    icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
}

function closeSidebarMenu() {
    const bioDropdown = document.getElementById('bioDropdown');
    const menuOverlay = document.getElementById('menuOverlay');
    if (bioDropdown) bioDropdown.style.transform = 'translateX(100%)';
    if (menuOverlay) menuOverlay.classList.add('hidden');
}

function toggleEndpoint(catIdx, epIdx) {
    const content = document.getElementById(`ep-${catIdx}-${epIdx}`);
    const icon = document.getElementById(`ep-icon-${catIdx}-${epIdx}`);
    content.classList.toggle('hidden');
    icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
}

function getContentType(url, contentType) {
    if (contentType) {
        if (contentType.includes('image/')) return 'image';
        if (contentType.includes('video/')) return 'video';
        if (contentType.includes('audio/')) return 'audio';
        if (contentType.includes('application/pdf')) return 'pdf';
    }
    if (url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg') || url.includes('.webp')) return 'image';
    if (url.includes('.mp4')) return 'video';
    if (url.includes('.mp3')) return 'audio';
    if (url.includes('.pdf')) return 'pdf';
    return 'unknown';
}

function openImageModal(imgSrc) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalTargetImg');
    if (modal && modalImg) {
        modalImg.src = imgSrc;
        modal.classList.remove('hidden');
        setTimeout(() => {
            modalImg.classList.remove('scale-95');
            modalImg.classList.add('scale-100');
        }, 10);
    }
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalTargetImg');
    if (modal && modalImg) {
        modalImg.classList.remove('scale-100');
        modalImg.classList.add('scale-95');
        setTimeout(() => { modal.classList.add('hidden'); }, 150);
    }
}

function loadApis() {
    const apiList = document.getElementById('apiList');
    if (!apiList || !apiData) return;

    apiList.innerHTML = '';
    allApiElements = [];
    totalEndpoints = 0;

    const currentFilterBar = document.getElementById('categoryFilterBar');
    const activeFilters = Array.from(currentFilterBar.querySelectorAll('.filter-btn')).map(b => b.id.replace('cat-filter-', ''));
    
    apiData.categories.forEach((cat, catIdx) => {
        const lowerCatName = cat.name.toLowerCase();
        if (lowerCatName !== 'other') totalEndpoints += cat.items.length;

        const isLight = currentTheme === 'light';
        const panelBgClass = isLight ? 'bg-white/80 border-slate-200 shadow-xs' : 'bg-slate-900/40 border-white/5';
        const headerBgClass = isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-white/5';

        const catIcon = categoryIcons[lowerCatName] || categoryIcons['default'];

        const catContainer = document.createElement('div');
        catContainer.id = `cat-box-${lowerCatName}`;
        catContainer.className = `glass-panel ${panelBgClass} rounded-2xl overflow-hidden shadow-md border transition-all duration-200`;
        
        let headerHtml = `
            <div onclick="toggleCategory(${catIdx})" class="p-4 flex items-center justify-between cursor-pointer border-b ${headerBgClass} select-none transition-colors">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-inner">
                        ${catIcon}
                    </div>
                    <div>
                        <h2 class="text-sm font-bold tracking-tight text-white light-mode:text-slate-900 font-['Space_Grotesk']">${cat.name}</h2>
                        <p class="text-[10px] text-slate-400 font-['JetBrains_Mono'] mt-0.5">${cat.items.length} ${i18n[currentLang].endpointsCount}</p>
                    </div>
                </div>
                <button class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all light-mode:text-slate-500 light-mode:hover:text-slate-800">
                    <svg id="cat-icon-${catIdx}" class="w-4 h-4 transition-transform duration-300 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
            <div id="cat-${catIdx}" class="p-4 space-y-4"></div>
        `;
        
        catContainer.innerHTML = headerHtml;
        const itemsContainer = catContainer.querySelector(`#cat-${catIdx}`);

        cat.items.forEach((ep, epIdx) => {
            const epId = `ep-card-${catIdx}-${epIdx}`;
            const epWrapper = document.createElement('div');
            epWrapper.id = epId;
            epWrapper.className = "border border-white/5 light-mode:border-slate-200/60 rounded-xl overflow-hidden transition-all duration-200 bg-black/10 light-mode:bg-slate-50/50";

            const method = (ep.methods && ep.methods[0]) || 'GET';
            let badgeColor = "bg-cyan-500 text-slate-950 shadow-cyan-500/10";
            if (method === 'POST') badgeColor = "bg-purple-500 text-white shadow-purple-500/10";
            if (method === 'DELETE') badgeColor = "bg-red-500 text-white shadow-red-500/10";
            if (method === 'PUT') badgeColor = "bg-amber-500 text-slate-950 shadow-amber-500/10";

            // BADGE STATUS (READY / ERROR)
            const isError = ep.status === "error";
            const statusBadge = isError 
                ? `<span class="px-2 py-0.5 rounded text-[9px] font-bold font-['JetBrains_Mono'] bg-red-500/20 text-red-400 border border-red-500/30">ERROR</span>`
                : `<span class="px-2 py-0.5 rounded text-[9px] font-bold font-['JetBrains_Mono'] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">READY</span>`;

            // BADGE PREMIUM / FREE
            const isPremium = ep.type === "premium";
            const typeBadge = isPremium
                ? `<span class="px-2 py-0.5 rounded text-[9px] font-bold font-['JetBrains_Mono'] bg-amber-500 text-slate-950 border border-amber-500/40 shadow-xs">PREMIUM</span>`
                : `<span class="px-2 py-0.5 rounded text-[9px] font-bold font-['JetBrains_Mono'] bg-slate-500/20 text-slate-400 border border-white/5 light-mode:border-slate-300">FREE</span>`;

            let paramInputsHtml = '';
            const paramKeys = Object.keys(ep.params || {});
            
            if (paramKeys.length > 0) {
                paramInputsHtml = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">`;
                paramKeys.forEach(pKey => {
                    const isApikeyParam = pKey === 'apikey';
                    const placeholderText = isApikeyParam 
                        ? (isPremium ? "Masukkan API Key Premium Anda" : "Masukkan API Key Free Anda")
                        : `Parameter ${pKey}...`;
                    const defaultValue = isApikeyParam ? "" : "";

                    paramInputsHtml += `
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold font-['JetBrains_Mono'] text-slate-400 light-mode:text-slate-600 tracking-wide flex items-center gap-1">
                                ${pKey} <span class="text-red-500 text-[9px]">*</span>
                            </label>
                            <input type="text" name="${pKey}" value="${defaultValue}" placeholder="${placeholderText}" oninput="updateLivePreview(${catIdx}, ${epIdx}, '${method}', '${ep.path}')" class="w-full bg-black/20 light-mode:bg-white border border-white/10 light-mode:border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-200 light-mode:text-slate-800 focus:outline-none focus:border-cyan-500/50 transition-colors font-['Space_Grotesk']" required />
                        </div>
                    `;
                });
                paramInputsHtml += `</div>`;
            }

            // Menonaktifkan button eksekusi jika status endpoint ERROR
            const executeButtonHtml = isError
                ? `<button type="button" disabled class="px-4 py-2 rounded-lg text-xs font-bold font-['JetBrains_Mono'] bg-slate-800 border border-white/5 text-slate-500 cursor-not-allowed flex items-center gap-1.5">${i18n[currentLang].btnExecute}</button>`
                : `<button type="submit" class="px-4 py-2 rounded-lg text-xs font-bold font-['JetBrains_Mono'] bg-cyan-500 text-slate-950 hover:bg-cyan-400 border border-cyan-500 shadow-md shadow-cyan-500/10 transition-all active:scale-95 flex items-center gap-1.5">${i18n[currentLang].btnExecute}</button>`;

            let innerEpHtml = `
                <div onclick="toggleEndpoint(${catIdx}, ${epIdx})" class="p-3 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none bg-white/[0.02] light-mode:bg-black/[0.01] hover:bg-white/[0.05] light-mode:hover:bg-black/[0.03] transition-colors">
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                        <span class="px-2 py-1 rounded text-[9px] font-bold font-['JetBrains_Mono'] tracking-wide shadow-xs ${badgeColor}">
                            ${method}
                        </span>
                        <span class="text-xs font-bold font-['JetBrains_Mono'] text-slate-300 light-mode:text-slate-700 truncate tracking-tight">
                            ${ep.name}
                        </span>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                        ${typeBadge}
                        ${statusBadge}
                        <svg id="ep-icon-${catIdx}-${epIdx}" class="w-3.5 h-3.5 text-slate-500 transition-transform duration-300 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                <div id="ep-${catIdx}-${epIdx}" class="hidden p-4 border-t border-white/5 light-mode:border-slate-200/60 bg-black/5 light-mode:bg-white/30 space-y-4">
                    <form id="form-${catIdx}-${epIdx}" onsubmit="fireRequest(event, ${catIdx}, ${epIdx}, '${method}', '${ep.path}', ${isError})">
                        ${paramInputsHtml}
                        <div class="flex items-center justify-between gap-3 pt-1">
                            <div class="flex gap-2">
                                ${executeButtonHtml}
                                <button type="button" onclick="clearResponse(${catIdx}, ${epIdx})" class="px-4 py-2 rounded-lg text-xs font-bold font-['JetBrains_Mono'] border border-white/10 light-mode:border-slate-200 bg-slate-900/40 light-mode:bg-white text-slate-400 light-mode:text-slate-600 hover:text-slate-200 light-mode:hover:text-slate-900 hover:bg-slate-800/40 light-mode:hover:bg-slate-50 transition-all active:scale-95">
                                    ${i18n[currentLang].btnClear}
                                </button>
                            </div>
                        </div>
                    </form>

                    <div class="space-y-3 font-['JetBrains_Mono']">
                        <div class="space-y-1">
                            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                                <span>Request URL</span>
                                <button onclick="copyFromElement('live-url-${catIdx}-${epIdx}', 'Request URL')" class="text-cyan-500 hover:text-cyan-400 transition-colors text-[9px] font-bold">COPY</button>
                            </div>
                            <div id="live-url-${catIdx}-${epIdx}" class="w-full bg-black/40 light-mode:bg-slate-100 border border-white/5 light-mode:border-slate-200/80 rounded-lg p-2.5 text-[11px] text-slate-400 light-mode:text-slate-600 break-all whitespace-pre-wrap select-all">
                                ${BASE_URL}${ep.path}
                            </div>
                        </div>

                        <div class="space-y-1">
                            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                                <span>cURL Command</span>
                                <button onclick="copyFromElement('live-curl-${catIdx}-${epIdx}', 'cURL')" class="text-cyan-500 hover:text-cyan-400 transition-colors text-[9px] font-bold">COPY</button>
                            </div>
                            <div id="live-curl-${catIdx}-${epIdx}" class="w-full bg-black/40 light-mode:bg-slate-100 border border-white/5 light-mode:border-slate-200/80 rounded-lg p-2.5 text-[11px] text-slate-400 light-mode:text-slate-600 break-all whitespace-pre-wrap select-all">
                                curl -X ${method} "${BASE_URL}${ep.path}"
                            </div>
                        </div>

                        <div id="res-box-${catIdx}-${epIdx}" class="hidden space-y-1.5 animate-fadeIn">
                            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <span>Response Console</span>
                                    <span id="res-status-code-${catIdx}-${epIdx}" class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">200 OK</span>
                                    <span id="res-time-${catIdx}-${epIdx}" class="text-[9px] text-slate-600 font-normal lowercase">120ms</span>
                                </div>
                                <button onclick="copyFromElement('raw-response-${catIdx}-${epIdx}', 'JSON Response')" class="text-cyan-500 hover:text-cyan-400 transition-colors text-[9px] font-bold">COPY JSON</button>
                            </div>

                            <div id="rendered-media-preview-${catIdx}-${epIdx}" class="hidden w-full bg-black/30 light-mode:bg-slate-50 rounded-xl p-3 border border-white/5 light-mode:border-slate-200 flex flex-col items-center justify-center gap-3"></div>

                            <div class="relative group">
                                <pre id="raw-response-${catIdx}-${epIdx}" class="w-full max-h-[320px] bg-[#020617] border border-white/10 light-mode:border-slate-200 rounded-lg p-3 text-[11px] text-emerald-400 font-['JetBrains_Mono'] overflow-y-auto scrollbar-thin select-text tracking-normal leading-relaxed"></pre>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            epWrapper.innerHTML = innerEpHtml;
            itemsContainer.appendChild(epWrapper);

            allApiElements.push({
                category: lowerCatName,
                name: ep.name.toLowerCase(),
                path: ep.path.toLowerCase(),
                element: epWrapper
            });
        });

        if (cat.items.length > 0) {
            apiList.appendChild(catContainer);
            if (!activeFilters.includes(lowerCatName)) {
                totalCategories++;
                const newFilterBtn = document.createElement('button');
                newFilterBtn.id = `cat-filter-${lowerCatName}`;
                newFilterBtn.className = "filter-btn";
                newFilterBtn.onclick = () => filterCategory(lowerCatName);
                newFilterBtn.textContent = cat.name;
                currentFilterBar.appendChild(newFilterBtn);
            }
        }
    });

    updateTotalEndpoints();
    updateTotalCategories();
    applyCategoryView();
}

function applyCategoryView() {
    const categoriesBoxes = document.querySelectorAll('[id^="cat-box-"]');
    categoriesBoxes.forEach(box => {
        const currentId = box.id.replace('cat-box-', '');
        if (activeCategory === 'all' || activeCategory === currentId) {
            box.classList.remove('hidden');
        } else {
            box.classList.add('hidden');
        }
    });
}

function filterCategory(catName) {
    activeCategory = catName;
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        if (btn.id === `cat-filter-${catName}`) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    applyCategoryView();
    performSearch();
}

function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const noResults = document.getElementById('noResults');
    let hasResults = false;

    const categoriesBoxes = document.querySelectorAll('[id^="cat-box-"]');
    
    categoriesBoxes.forEach(box => {
        const catName = box.id.replace('cat-box-', '');
        const isCatMatchesFilter = (activeCategory === 'all' || activeCategory === catName);
        let validItemsInBox = 0;

        allApiElements.forEach(item => {
            if (item.category === catName) {
                const isMatchQuery = item.name.includes(query) || item.path.includes(query);
                if (isCatMatchesFilter && isMatchQuery) {
                    item.element.classList.remove('hidden');
                    validItemsInBox++;
                    hasResults = true;
                } else {
                    item.element.classList.add('hidden');
                }
            }
        });

        if (isCatMatchesFilter && validItemsInBox > 0) {
            box.classList.remove('hidden');
        } else {
            box.classList.add('hidden');
        }
    });

    if (hasResults) {
        noResults.classList.add('hidden');
    } else {
        noResults.classList.remove('hidden');
    }
}

function fireRequest(event, catIdx, epIdx, method, path, isError) {
    event.preventDefault();

    if (isError) {
        showToast(i18n[currentLang].endpointNotAvailable, true);
        return;
    }

    if (isRequestInProgress) {
        showToast(i18n[currentLang].toastRequestWait, true);
        return;
    }

    isRequestInProgress = true;
    const startTime = performance.now();

    const form = document.getElementById(`form-${catIdx}-${epIdx}`);
    const resBox = document.getElementById(`res-box-${catIdx}-${epIdx}`);
    const codeEl = document.getElementById(`res-status-code-${catIdx}-${epIdx}`);
    const timeEl = document.getElementById(`res-time-${catIdx}-${epIdx}`);
    const responseEl = document.getElementById(`raw-response-${catIdx}-${epIdx}`);
    const mediaPreview = document.getElementById(`rendered-media-preview-${catIdx}-${epIdx}`);

    resBox.classList.remove('hidden');
    responseEl.textContent = 'Firing payload, downloading buffers headers...';
    responseEl.className = "w-full max-h-[320px] bg-[#020617] border border-white/10 rounded-lg p-3 text-[11px] text-slate-400 font-['JetBrains_Mono'] overflow-y-auto";
    mediaPreview.classList.add('hidden');
    mediaPreview.innerHTML = '';

    const formData = new FormData(form);
    let fetchUrl = `${BASE_URL}${path}`;
    let fetchOptions = { method: method };

    if (method === 'GET') {
        const params = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
            if (value) params.append(key, value);
        }
        if (params.toString()) fetchUrl += `?${params.toString()}`;
    } else {
        const bodyObj = {};
        for (const [key, value] of formData.entries()) {
            if (value) bodyObj[key] = value;
        }
        fetchOptions.headers = { 'Content-Type': 'application/json' };
        fetchOptions.body = JSON.stringify(bodyObj);
    }

    fetch(fetchUrl, fetchOptions)
        .then(async (res) => {
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);
            timeEl.textContent = `${duration}ms`;

            codeEl.textContent = `${res.status} ${res.statusText || 'OK'}`;
            if (res.ok) {
                codeEl.className = "px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/10 text-emerald-400 border border-green-500/20";
            } else {
                codeEl.className = "px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20";
            }

            const contentType = res.headers.get('content-type') || '';
            
            if (contentType.includes('application/json')) {
                const json = await res.json();
                responseEl.textContent = JSON.stringify(json, null, 4);
                responseEl.className = "w-full max-h-[320px] bg-[#020617] border border-white/10 rounded-lg p-3 text-[11px] text-emerald-400 font-['JetBrains_Mono'] overflow-y-auto";
                
                let mediaUrl = json.url || (json.result && (json.result.url || json.result.media || json.result.download)) || json.download || json.media;
                if (typeof mediaUrl === 'string' && (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://'))) {
                    renderMediaPreview(mediaUrl, contentType, mediaPreview);
                }
            } else if (contentType.includes('image/') || contentType.includes('video/') || contentType.includes('audio/')) {
                responseEl.textContent = `[Binary Resource Buffer Data]\nContent-Type: ${contentType}\nResource URL: ${fetchUrl}`;
                responseEl.className = "w-full max-h-[320px] bg-[#020617] border border-white/10 rounded-lg p-3 text-[11px] text-cyan-400 font-['JetBrains_Mono'] overflow-y-auto";
                renderMediaPreview(fetchUrl, contentType, mediaPreview);
            } else {
                const text = await res.text();
                responseEl.textContent = text.substring(0, 5000);
                responseEl.className = "w-full max-h-[320px] bg-[#020617] border border-white/10 rounded-lg p-3 text-[11px] text-amber-400 font-['JetBrains_Mono'] overflow-y-auto";
            }

            if (res.ok) {
                showToast(i18n[currentLang].toastRequestSuccess);
            } else {
                showToast(i18n[currentLang].toastRequestFailed, true);
            }
            fetchStats();
        })
        .catch(err => {
            const endTime = performance.now();
            timeEl.textContent = `${Math.round(endTime - startTime)}ms`;
            codeEl.textContent = 'NET_ERR';
            codeEl.className = "px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20";
            responseEl.textContent = `Local Connection Failure Error:\n${err.message}`;
            responseEl.className = "w-full max-h-[320px] bg-[#020617] border border-white/10 rounded-lg p-3 text-[11px] text-red-400 font-['JetBrains_Mono'] overflow-y-auto";
            showToast(i18n[currentLang].toastRequestFailed, true);
        })
        .finally(() => {
            isRequestInProgress = false;
        });
}

function renderMediaPreview(url, contentType, container) {
    const detected = getContentType(url, contentType);
    container.innerHTML = '';
    
    let el = null;
    if (detected === 'image') {
        el = document.createElement('img');
        el.src = url;
        el.className = "max-w-full max-h-[200px] rounded-lg object-contain shadow-md cursor-zoom-in border border-white/10";
        el.onclick = () => openImageModal(url);
    } else if (detected === 'video') {
        el = document.createElement('video');
        el.src = url;
        el.controls = true;
        el.className = "w-full max-h-[220px] rounded-lg shadow-md border border-white/10";
    } else if (detected === 'audio') {
        el = document.createElement('audio');
        el.src = url;
        el.controls = true;
        el.className = "w-full outline-none mt-1";
    }

    if (el) {
        container.classList.remove('hidden');
        container.appendChild(el);

        const copyMediaBtn = document.createElement('button');
        copyMediaBtn.className = "px-3 py-1 bg-cyan-500 text-slate-950 font-bold font-['JetBrains_Mono'] rounded text-[10px] hover:bg-cyan-400 transition-all active:scale-95 shadow-sm";
        copyMediaBtn.textContent = "COPY URL MEDIA";
        copyMediaBtn.onclick = (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(url)
                .then(() => showToast(i18n[currentLang].toastMediaCopy))
                .catch(() => showToast(i18n[currentLang].toastMediaFail, true));
        };
        container.appendChild(copyMediaBtn);
    }
}

function clearResponse(catIdx, epIdx) {
    const resBox = document.getElementById(`res-box-${catIdx}-${epIdx}`);
    const mediaPreview = document.getElementById(`rendered-media-preview-${catIdx}-${epIdx}`);
    const responseEl = document.getElementById(`raw-response-${catIdx}-${epIdx}`);
    const form = document.getElementById(`form-${catIdx}-${epIdx}`);

    if (resBox) resBox.classList.add('hidden');
    if (mediaPreview) {
        mediaPreview.classList.add('hidden');
        mediaPreview.innerHTML = '';
    }
    if (responseEl) responseEl.textContent = '';
    if (form) form.reset();
    updateLivePreview(catIdx, epIdx, 'GET', `/api/any`);
}

// === MUSIK CONTROLLER SYSTEM (FIXED TRACK COMPONENT) ===
let currentMusicIdx = 0;
let audioPlayer = new Audio();
let isMusicPlaying = false;

function initPlaylistPlayer() {
    if (typeof playlistData === 'undefined' || !playlistData.length) return;
    loadMusicTrack(0);

    audioPlayer.addEventListener('timeupdate', () => {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        const bar = document.getElementById('musicProgressBar');
        if (bar) bar.style.width = `${progress || 0}%`;

        const curTimeEl = document.getElementById('musicCurrentTime');
        if (curTimeEl) curTimeEl.textContent = formatMusicTime(audioPlayer.currentTime);
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
        const durEl = document.getElementById('musicDuration');
        if (durEl) durEl.textContent = formatMusicTime(audioPlayer.duration);
        document.getElementById('musicLoadingSpinner').style.opacity = '0';
    });

    audioPlayer.addEventListener('waiting', () => {
        document.getElementById('musicLoadingSpinner').style.opacity = '1';
    });

    audioPlayer.addEventListener('playing', () => {
        document.getElementById('musicLoadingSpinner').style.opacity = '0';
    });

    audioPlayer.addEventListener('ended', () => {
        playNextMusic();
    });
}

function loadMusicTrack(index) {
    currentMusicIdx = index;
    const track = playlistData[index];
    
    document.getElementById('musicTitle').textContent = track.title;
    document.getElementById('musicArtist').textContent = track.artist;
    document.getElementById('musicCover').src = track.cover;
    
    document.getElementById('musicLoadingSpinner').style.opacity = '1';
    audioPlayer.src = track.url;
    audioPlayer.load();

    if (isMusicPlaying) {
        audioPlayer.play().catch(e => console.log("Autoplay blocked:", e));
    }
}

function togglePlayPause() {
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');

    if (isMusicPlaying) {
        audioPlayer.pause();
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        isMusicPlaying = false;
    } else {
        audioPlayer.play().then(() => {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
            isMusicPlaying = true;
        }).catch(err => {
            showToast("Gagal memutar audio / diblokir browser", true);
        });
    }
}

function playNextMusic() {
    let nextIdx = currentMusicIdx + 1;
    if (nextIdx >= playlistData.length) nextIdx = 0;
    loadMusicTrack(nextIdx);
    if (!isMusicPlaying) togglePlayPause();
}

function seekAudio(event) {
    const bg = document.getElementById('progressBarBg');
    if (!bg || !audioPlayer.duration) return;

    const rect = bg.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    audioPlayer.currentTime = percentage * audioPlayer.duration;
}

function formatMusicTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// === INITIALIZATION RUNNER ===
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    const savedLang = localStorage.getItem('lang') || 'id';
    setLanguage(savedLang);
    initDigitalClock();
    initPlaylistPlayer();
    fetchStats();

    const bioMenuBtn = document.getElementById('bioMenuBtn');
    const bioDropdown = document.getElementById('bioDropdown');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const menuOverlay = document.getElementById('menuOverlay');

    if (bioMenuBtn && bioDropdown && menuOverlay) {
        bioMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            bioDropdown.style.transform = 'translateX(0)';
            menuOverlay.classList.remove('hidden');
        });
        if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeSidebarMenu);
        menuOverlay.addEventListener('click', closeSidebarMenu);
        bioDropdown.addEventListener('click', (e) => { e.stopPropagation(); });
    }

    fetch('/api/apilist')
        .then(res => res.json())
        .then(data => {
            apiData = data;
            loadApis();
        })
        .catch(err => {
            document.getElementById('apiList').innerHTML = `<div class="text-center p-8 bg-red-900/20 border border-red-700 rounded-lg"><div class="text-4xl mb-4">⚠️</div><h3 class="font-bold text-lg mb-2">Failed to load API data</h3></div>`;
        });
});

themeToggleBtn.addEventListener('click', toggleTheme);

let searchTimeout;
document.getElementById('searchInput').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 150);
});
