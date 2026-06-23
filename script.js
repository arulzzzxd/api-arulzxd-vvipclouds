const BASE_URL = window.location.origin;
let isRequestInProgress = false;
let apiData = null;
let currentTheme = 'dark';
let currentLang = 'id';
let allApiElements = [];
let totalEndpoints = 0;
let totalCategories = 0;
let batteryMonitor = null;
let batteryInterval = null;
let boundUpdateBatteryInfo = null; 
let activeCategory = 'all';

const themeToggleBtn = document.getElementById('themeToggle');
const body = document.body;
const themeBg = document.getElementById('themeBg');

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

    'game': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M7 8h10a4 4 0 0 1 4 4v4a3 3 0 0 1-5.12 2.12L13.76 16H10.24l-2.12 2.12A3 3 0 0 1 3 16v-4a4 4 0 0 1 4-4zm0 3v2H5v2h2v2h2v-2h2v-2H9v-2H7zm9 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm3 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>',

    'quotes': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M7 17H3V9h6v6c0 1.1-.9 2-2 2zm10 0h-4V9h6v6c0 1.1-.9 2-2 2z"/></svg>',

    'sticker': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M5 3h10l4 4v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm9 1v4h4M8 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm8 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-4 5c2.2 0 4-1.3 4-3H8c0 1.7 1.8 3 4 3z"/></svg>',

    'default': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>'
};

const i18n = {
    id: {
        searchPlaceholder: "Cari endpoint berdasarkan nama, path, atau kategori...",
        noResultsTitle: "Endpoint tidak ditemukan",
        noResultsDesc: "Coba gunakan kata kunci lain",
        batteryTitle: "Baterai Anda",
        endpointsTitle: "Total Endpoint",
        categoriesTitle: "Total Kategori",
        batteryDetecting: "Mendeteksi...",
        batteryCharging: "Mengisi Daya",
        batteryFull: "Penuh",
        batteryDischarging: "Menguras Daya",
        batteryLeft: "tersisa",
        endpointsCount: "endpoints",
        btnExecute: "Eksekusi",
        btnClear: "Bersihkan",
        toastMediaCopy: "Media URL disalin ke papan klip!",
        toastMediaFail: "Gagal menyalin URL",
        endpointNotAvailable: "⚠️ Endpoint ini tidak tersedia untuk pengujian",
        toastRequestWait: "Harap tunggu permintaan saat ini selesai",
        toastRequestSuccess: "Permintaan berhasil diselesaikan!",
        toastRequestFailed: "Permintaan gagal!",
        batterySimulated: "Simulasi"
    },
    en: {
        searchPlaceholder: "Search endpoints by name, path, or category...",
        noResultsTitle: "No endpoints found",
        noResultsDesc: "Try a different search term",
        batteryTitle: "Your Battery",
        endpointsTitle: "Total Endpoints",
        categoriesTitle: "Total Categories",
        batteryDetecting: "Detecting...",
        batteryCharging: "Charging",
        batteryFull: "Fully charged",
        batteryDischarging: "Discharging",
        batteryLeft: "left",
        endpointsCount: "endpoints",
        btnExecute: "Execute",
        btnClear: "Clear",
        toastMediaCopy: "Media URL copied to clipboard!",
        toastMediaFail: "Failed to copy URL",
        endpointNotAvailable: "⚠️ This endpoint is not available for testing",
        toastRequestWait: "Please wait for current request",
        toastRequestSuccess: "Request completed successfully!",
        toastRequestFailed: "Request failed!",
        batterySimulated: "Simulated"
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
    document.getElementById('stat-battery-title').textContent = i18n[lang].batteryTitle;
    document.getElementById('stat-endpoints-title').textContent = i18n[lang].endpointsTitle;
    document.getElementById('stat-categories-title').textContent = i18n[lang].categoriesTitle;

    if (batteryMonitor || batteryInterval) {
        window.dispatchEvent(new Event('batteryupdate-hook'));
    }

    const dateElement = document.getElementById('liveDate');
    if (dateElement && typeof moment !== 'undefined') {
        const now = moment().tz("Asia/Jakarta");
        const formatLang = lang === 'id' ? 'id' : 'en';
        dateElement.textContent = now.locale(formatLang).format('dddd, D MMMM YYYY');
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

function initBatteryDetection() {
    const batteryLevelElement = document.getElementById('batteryLevel');
    const batteryPercentageElement = document.getElementById('batteryPercentage');
    const batteryStatusElement = document.getElementById('batteryStatus');
    const batteryContainer = document.getElementById('batteryContainer');
    
    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            boundUpdateBatteryInfo = function updateBatteryInfo() {
                const level = battery.level * 100;
                const isCharging = battery.charging;
                const roundedLevel = Math.round(level);
                const isLightMode = body.classList.contains('light-mode');
                
                batteryPercentageElement.textContent = `${roundedLevel}%`;
                batteryLevelElement.style.width = `${level}%`;
                
                if (level > 60) {
                    batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-green-600' : 'bg-green-500');
                } else if (level > 20) {
                    batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-yellow-600' : 'bg-yellow-500');
                } else {
                    batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-red-600' : 'bg-red-500');
                }
                
                if (isCharging) {
                    batteryContainer.classList.add('charging');
                    batteryStatusElement.textContent = i18n[currentLang].batteryCharging;
                    batteryLevelElement.classList.add('battery-charging');
                } else {
                    batteryContainer.classList.remove('charging');
                    batteryLevelElement.classList.remove('battery-charging');
                    
                    if (battery.dischargingTime === Infinity) {
                        batteryStatusElement.textContent = i18n[currentLang].batteryFull;
                    } else {
                        batteryStatusElement.textContent = i18n[currentLang].batteryDischarging;
                    }
                }
                
                if (isCharging && battery.chargingTime !== Infinity) {
                    const hours = Math.floor(battery.chargingTime / 3600);
                    const minutes = Math.floor((battery.chargingTime % 3600) / 60);
                    const timeStr = currentLang === 'id' ? `${hours}jam ${minutes}menit` : `${hours}h ${minutes}m`;
                    batteryStatusElement.textContent = `${i18n[currentLang].batteryCharging} (${timeStr})`;
                } else if (!isCharging && battery.dischargingTime !== Infinity) {
                    const hours = Math.floor(battery.dischargingTime / 3600);
                    const minutes = Math.floor((battery.dischargingTime % 3600) / 60);
                    const suffix = i18n[currentLang].batteryLeft;
                    const timeUnit = currentLang === 'id' ? `${hours}jam ${minutes}menit` : `${hours}h ${minutes}m`;
                    batteryStatusElement.textContent = `${timeUnit} ${suffix}`;
                }
            };
            
            boundUpdateBatteryInfo();
            battery.addEventListener('levelchange', boundUpdateBatteryInfo);
            battery.addEventListener('chargingchange', boundUpdateBatteryInfo);
            battery.addEventListener('chargingtimechange', boundUpdateBatteryInfo);
            battery.addEventListener('dischargingtimechange', boundUpdateBatteryInfo);
            window.addEventListener('batteryupdate-hook', boundUpdateBatteryInfo);
            batteryMonitor = battery;
            
        }).catch(function(error) {
            console.error("Battery API error:", error);
            fallbackBattery();
        });
    } else {
        console.log("Battery Status API not supported");
        fallbackBattery();
    }
    
    function fallbackBattery() {
        let simulatedLevel = localStorage.getItem('simulatedBattery');
        if (!simulatedLevel) {
            simulatedLevel = Math.floor(Math.random() * 30) + 30;
            localStorage.setItem('simulatedBattery', simulatedLevel.toString());
        } else {
            simulatedLevel = parseInt(simulatedLevel);
        }
        
        let isSimulatedCharging = localStorage.getItem('simulatedCharging') === 'true';
        
        function simulateBattery() {
            const isLightMode = body.classList.contains('light-mode');
            let newLevel = simulatedLevel;
            
            if (isSimulatedCharging) {
                const chargeRate = 0.5;
                newLevel = Math.min(100, newLevel + chargeRate);
                
                if (newLevel >= 100) {
                    isSimulatedCharging = false;
                    localStorage.setItem('simulatedCharging', 'false');
                    batteryContainer.classList.remove('charging');
                    batteryLevelElement.classList.remove('battery-charging');
                    batteryStatusElement.textContent = i18n[currentLang].batteryFull;
                } else {
                    batteryStatusElement.textContent = i18n[currentLang].batteryCharging;
                }
            } else {
                const drainRate = 0.1;
                newLevel = Math.max(5, newLevel - drainRate);
                
                if (newLevel <= 15 && Math.random() > 0.7) {
                    isSimulatedCharging = true;
                    localStorage.setItem('simulatedCharging', 'true');
                    batteryContainer.classList.add('charging');
                    batteryLevelElement.classList.add('battery-charging');
                    batteryStatusElement.textContent = i18n[currentLang].batteryCharging;
                } else {
                    const minutesLeft = Math.round((newLevel - 5) / drainRate);
                    const hours = Math.floor(minutesLeft / 60);
                    const minutes = minutesLeft % 60;
                    const suffix = i18n[currentLang].batteryLeft;
                    
                    if (hours > 0) {
                        const timeUnit = currentLang === 'id' ? `${hours}jam ${minutes}menit` : `${hours}h ${minutes}m`;
                        batteryStatusElement.textContent = `${timeUnit} ${suffix}`;
                    } else {
                        const timeUnit = currentLang === 'id' ? `${minutes}menit` : `${minutes}m`;
                        batteryStatusElement.textContent = `${timeUnit} ${suffix}`;
                    }
                }
            }
            simulatedLevel = newLevel;
            localStorage.setItem('simulatedBattery', newLevel.toString());
            
            const roundedLevel = Math.round(newLevel);
            batteryPercentageElement.textContent = `${roundedLevel}%`;
            batteryLevelElement.style.width = `${newLevel}%`;
            
            if (newLevel > 60) {
                batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-green-600' : 'bg-green-500');
            } else if (newLevel > 20) {
                batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-yellow-600' : 'bg-yellow-500');
            } else {
                batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-red-600' : 'bg-red-500');
            }
        }
        
        simulateBattery();
        window.addEventListener('batteryupdate-hook', simulateBattery);
        if (!batteryInterval) {
            batteryInterval = setInterval(simulateBattery, 10000);
        }
    }
}

function cleanupBatteryMonitor() {
    if (batteryMonitor && boundUpdateBatteryInfo) {
        batteryMonitor.removeEventListener('levelchange', boundUpdateBatteryInfo);
        batteryMonitor.removeEventListener('chargingchange', boundUpdateBatteryInfo);
        batteryMonitor.removeEventListener('chargingtimechange', boundUpdateBatteryInfo);
        batteryMonitor.removeEventListener('dischargingtimechange', boundUpdateBatteryInfo);
        window.removeEventListener('batteryupdate-hook', boundUpdateBatteryInfo);
        batteryMonitor = null;
        boundUpdateBatteryInfo = null;
    }
    if (batteryInterval) {
        clearInterval(batteryInterval);
        batteryInterval = null;
    }
}

function initDigitalClock() {
    const clockElement = document.getElementById('liveClock');
    const dateElement = document.getElementById('liveDate');
    if (!clockElement || !dateElement) return;

    function updateClock() {
        if (typeof moment === 'undefined') return;
        const now = moment().tz("Asia/Jakarta");
        clockElement.textContent = now.format('HH:mm:ss');
        if (currentLang === 'id') {
            dateElement.textContent = now.locale('id').format('dddd, D MMMM YYYY');
        } else {
            dateElement.textContent = now.locale('en').format('dddd, MMMM D, YYYY');
        }
    }
    updateClock();
    setInterval(updateClock, 1000);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;

    if (type === 'success') {
        toast.className = 'toast show bg-emerald-500 text-white font-mono shadow-xl border border-emerald-400/20';
        toastIcon.innerHTML = '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>';
    } else {
        toast.className = 'toast show bg-rose-500 text-white font-mono shadow-xl border border-rose-400/20';
        toastIcon.innerHTML = '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>';
    }

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function loadApis() {
    if (!apiData || !apiData.categories) return;

    const listContainer = document.getElementById('apiList');
    const filtersContainer = document.getElementById('categoryFilters');
    
    const savedFilter = activeCategory;
    listContainer.innerHTML = '';
    filtersContainer.innerHTML = `<button class="filter-btn ${savedFilter === 'all' ? 'active' : ''}" data-category="all">All</button>`;

    totalEndpoints = 0;
    totalCategories = apiData.categories.length;

    apiData.categories.forEach(cat => {
        const catId = cat.name.toLowerCase();
        
        const filterBtn = document.createElement('button');
        filterBtn.className = `filter-btn ${savedFilter === catId ? 'active' : ''}`;
        filterBtn.setAttribute('data-category', catId);
        filterBtn.textContent = cat.name;
        filtersContainer.appendChild(filterBtn);

        if (savedFilter !== 'all' && savedFilter !== catId) {
            totalEndpoints += cat.items.length;
            return;
        }

        const catSection = document.createElement('div');
        catSection.className = 'glass-panel rounded-2xl p-4 md:p-6 shadow-lg border border-white/5 font-mono';
        
        const icon = categoryIcons[catId] || categoryIcons['default'];
        
        let sectionHtml = `
            <div class="flex items-center gap-3 border-b border-white/5 pb-4 mb-4 select-none">
                <div class="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">${icon}</div>
                <div>
                    <h2 class="font-bold text-base tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">${cat.name}</h2>
                    <p class="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">${cat.items.length} ${i18n[currentLang].endpointsCount}</p>
                </div>
            </div>
            <div class="space-y-4">
        `;

        cat.items.forEach((item, idx) => {
            totalEndpoints++;
            const uniqueId = `${catId}-${idx}`;
            const primaryMethod = item.methods && item.methods.length ? item.methods[0].toUpperCase() : 'GET';
            
            let methodColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            if (primaryMethod === 'POST') methodColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            if (primaryMethod === 'DELETE') methodColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            if (primaryMethod === 'PUT') methodColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';

            let typeBadge = '';
            if (item.type === 'premium') {
                typeBadge = `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 uppercase border border-amber-400/20 shadow-sm animate-pulse">VIP</span>`;
            } else {
                typeBadge = `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase border border-white/5">FREE</span>`;
            }

            let statusBadge = '';
            if (item.status === 'perbaikan' || item.status === 'error') {
                statusBadge = `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 uppercase border border-rose-500/20">FIXING</span>`;
            } else {
                statusBadge = `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase border border-emerald-500/20">READY</span>`;
            }

            sectionHtml += `
                <div class="api-item p-3.5 rounded-xl border border-white/5 bg-slate-900/20 hover:bg-slate-900/40 transition-all" data-name="${item.name.toLowerCase()}" data-path="${item.path.toLowerCase()}" data-desc="${item.desc.toLowerCase()}">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer" onclick="toggleEndpointDetails('${uniqueId}')">
                        <div class="flex items-center gap-2.5 overflow-hidden flex-1">
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${methodColor} tracking-wider min-w-[50px] text-center">${primaryMethod}</span>
                            <span class="text-xs font-bold text-slate-200 truncate hover:text-cyan-400 transition-colors">${item.name}</span>
                        </div>
                        <div class="flex items-center gap-2 select-none md:justify-end">
                            ${typeBadge}
                            ${statusBadge}
                            <svg id="icon-${uniqueId}" class="w-4 h-4 text-slate-500 transform transition-transform duration-200" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                        </div>
                    </div>

                    <div id="details-${uniqueId}" class="hidden mt-4 pt-4 border-t border-white/5 space-y-4">
                        <div class="space-y-2">
                            <label class="text-[11px] font-bold text-slate-400 block">ENDPOINT URL</label>
                            <div class="flex items-center gap-2">
                                <input type="text" value="${BASE_URL}${item.path}" readonly class="w-full text-xs p-2.5 rounded-xl bg-slate-950/40 text-cyan-400 border border-white/5 outline-none font-mono selection:bg-cyan-500/30" />
                            </div>
                        </div>

                        <form id="form-${uniqueId}" onsubmit="fireRequest(event, '${uniqueId}', '${item.path}', '${primaryMethod}')" class="space-y-3">
                            <div class="space-y-2.5">
                                <label class="text-[11px] font-bold text-slate-400 block">PARAMETERS</label>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            `;

            if (item.params && Object.keys(item.params).length > 0) {
                Object.keys(item.params).forEach(pKey => {
                    const pType = item.params[pKey];
                    // FITUR BARU: Deteksi jika nama parameter mengandung file atau tipenya file
                    if (pType === 'file' || pKey.toLowerCase() === 'file') {
                        sectionHtml += `
                            <div class="space-y-1 md:col-span-2">
                                <span class="text-[10px] text-slate-400 font-bold block">${pKey.toUpperCase()} <span class="text-amber-400 text-[9px]">(File Upload)</span></span>
                                <input type="file" name="${pKey}" id="input-${uniqueId}-${pKey}" required class="w-full text-xs p-2 rounded-xl bg-slate-950/40 text-slate-200 border border-white/5 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-mono file:bg-cyan-500/10 file:text-cyan-400 file:hover:bg-cyan-500/20 focus:outline-none focus:border-cyan-400 transition-all" />
                            </div>
                        `;
                    } else {
                        let defaultVal = '';
                        if (pKey === 'apikey') defaultVal = localStorage.getItem('api_key_cache') || 'arulzxd-keys';
                        
                        sectionHtml += `
                            <div class="space-y-1">
                                <span class="text-[10px] text-slate-400 font-bold block">${pKey.toUpperCase()}</span>
                                <input type="text" name="${pKey}" id="input-${uniqueId}-${pKey}" value="${defaultVal}" placeholder="Masukkan ${pKey}..." required class="w-full text-xs p-2.5 rounded-xl bg-slate-950/40 text-slate-200 border border-white/5 focus:outline-none focus:border-cyan-400 transition-all placeholder:text-slate-600 light-mode:placeholder:text-slate-400" autocomplete="off" />
                            </div>
                        `;
                    }
                });
            } else {
                sectionHtml += `<p class="text-xs text-slate-500 italic p-1">No parameters required.</p>`;
            }

            sectionHtml += `
                                </div>
                            </div>

                            <div class="flex gap-2.5 pt-1">
                                <button type="submit" class="text-xs font-bold px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl shadow-md shadow-cyan-500/10 hover:from-cyan-400 hover:to-blue-400 transition-all flex items-center gap-2 active:scale-95">
                                    ⚡ ${i18n[currentLang].btnExecute}
                                </button>
                                <button type="button" onclick="clearRequest('${uniqueId}')" class="text-xs font-bold px-4 py-2.5 bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10 rounded-xl transition-all active:scale-95">
                                    🗑️ ${i18n[currentLang].btnClear}
                                </button>
                            </div>
                        </form>

                        <div id="response-container-${uniqueId}" class="hidden space-y-2 animate-fadeIn">
                            <div class="flex justify-between items-center select-none">
                                <label class="text-[11px] font-bold text-slate-400 tracking-wide flex items-center gap-1.5">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> RESPONSE DATA
                                </label>
                                <span id="runtime-${uniqueId}" class="text-[10px] font-mono font-bold text-slate-500">0ms</span>
                            </div>
                            <div class="relative group">
                                <div class="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button onclick="copyResponseText('${uniqueId}')" class="p-1.5 bg-slate-900/80 rounded-lg border border-white/10 text-[10px] text-slate-300 hover:text-white backdrop-blur-sm shadow">COPY</button>
                                </div>
                                <pre id="response-${uniqueId}" class="text-[11px] p-4 rounded-xl bg-slate-950 border border-white/5 overflow-x-auto max-h-[350px] text-emerald-400 font-mono scrollbar-hide select-text selection:bg-emerald-500/20"></pre>
                            </div>
                            <div id="media-preview-${uniqueId}" class="hidden p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center gap-3 animate-fadeIn"></div>
                        </div>
                    </div>
                </div>
            `;
        });

        sectionHtml += `</div>`;
        catSection.innerHTML = sectionHtml;
        listContainer.appendChild(catSection);
    });

    document.getElementById('totalEndpoints').textContent = totalEndpoints;
    document.getElementById('totalCategories').textContent = totalCategories;

    setupFilterListeners();
    allApiElements = Array.from(document.querySelectorAll('.api-item'));
}

function toggleEndpointDetails(id) {
    const details = document.getElementById(`details-${id}`);
    const icon = document.getElementById(`icon-${id}`);
    if (!details || !icon) return;

    const isHidden = details.classList.contains('hidden');
    
    document.querySelectorAll('[id^="details-"]').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('[id^="icon-"]').forEach(el => el.classList.remove('rotate-180'));

    if (isHidden) {
        details.classList.remove('hidden');
        icon.classList.add('rotate-180');
        details.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function fireRequest(e, id, path, method) {
    e.preventDefault();
    if (isRequestInProgress) {
        showToast(i18n[currentLang].toastRequestWait, 'error');
        return;
    }

    const form = document.getElementById(`form-${id}`);
    const responseContainer = document.getElementById(`response-container-${id}`);
    const responsePre = document.getElementById(`response-${id}`);
    const runtimeSpan = document.getElementById(`runtime-${id}`);
    const mediaPreview = document.getElementById(`media-preview-${id}`);

    if (!form || !responseContainer || !responsePre || !runtimeSpan) return;

    isRequestInProgress = true;
    responseContainer.classList.remove('hidden');
    responsePre.textContent = 'Sending request...\nConnecting to api router layer...';
    responsePre.className = 'text-[11px] p-4 rounded-xl bg-slate-950 border border-white/5 overflow-x-auto max-h-[350px] text-cyan-400 font-mono';
    mediaPreview.classList.add('hidden');
    mediaPreview.innerHTML = '';

    const formDataInputs = new FormData(form);
    
    // Simpan API Key ke cache lokal agar user tidak perlu mengetik ulang nanti
    if (formDataInputs.has('apikey')) {
        localStorage.setItem('api_key_cache', formDataInputs.get('apikey'));
    }

    let requestUrl = `${BASE_URL}${path}`;
    let fetchOptions = { method: method };
    
    // FITUR UTAMA BARU: Deteksi pengiriman File Fisik (Multipart FormData vs Query Parameters)
    let hasFileInput = false;
    const fileElements = form.querySelectorAll('input[type="file"]');
    fileElements.forEach(el => {
        if (el.files.length > 0) hasFileInput = true;
    });

    if (hasFileInput && (method === 'POST' || method === 'PUT')) {
        // Jika ada input file pada form POST, kirim form langsung sebagai FormData binary
        fetchOptions.body = formDataInputs;
        // Jangan set Header Content-Type karena browser akan otomatis mengaturnya termasuk multipart boundary
    } else {
        // Jika parameter query string biasa
        const params = new URLSearchParams();
        for (const [key, value] of formDataInputs.entries()) {
            params.append(key, value);
        }
        if (method === 'GET' || method === 'DELETE') {
            if (params.toString()) requestUrl += `?${params.toString()}`;
        } else {
            fetchOptions.headers = { 'Content-Type': 'application/json' };
            const jsonBody = {};
            for (const [key, value] of formDataInputs.entries()) {
                jsonBody[key] = value;
            }
            fetchOptions.body = JSON.stringify(jsonBody);
        }
    }

    const startTime = performance.now();

    fetch(requestUrl, fetchOptions)
        .then(async (res) => {
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);
            runtimeSpan.textContent = `${duration}ms`;

            const contentType = res.headers.get('content-type') || '';
            
            if (contentType.includes('application/json')) {
                const data = await res.json();
                responsePre.textContent = JSON.stringify(data, null, 2);
                responsePre.className = 'text-[11px] p-4 rounded-xl bg-slate-950 border border-white/5 overflow-x-auto max-h-[350px] text-emerald-400 font-mono scrollbar-hide';
                showToast(i18n[currentLang].toastRequestSuccess, 'success');
                
                // Integrasi auto-render preview jika response JSON mengandung url gambar/audio/video valid
                handleMediaAutopreview(data, mediaPreview);
            } else if (contentType.includes('image/')) {
                responsePre.textContent = `[Binary Image Data]\nStatus: ${res.status} ${res.statusText}\nType: ${contentType}`;
                responsePre.className = 'text-[11px] p-4 rounded-xl bg-slate-950 border border-white/5 overflow-x-auto max-h-[350px] text-amber-400 font-mono';
                
                mediaPreview.classList.remove('hidden');
                mediaPreview.innerHTML = `
                    <div class="text-xs font-bold text-slate-400 border-b border-white/5 pb-2 w-full text-center uppercase tracking-wider">Image Resource Output</div>
                    <img src="${requestUrl}" class="max-h-60 rounded-lg shadow-inner object-contain cursor-zoom-in border border-white/10 bg-slate-950" onclick="openImageLightbox('${requestUrl}')"/>
                    <button onclick="copyToClipboard('${requestUrl}')" class="text-[10px] font-bold px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-all">COPY IMAGE URL</button>
                `;
                showToast(i18n[currentLang].toastRequestSuccess, 'success');
            } else if (contentType.includes('audio/')) {
                responsePre.textContent = `[Binary Audio Resource]\nStatus: ${res.status} ${res.statusText}\nSize: Connected Buffer stream`;
                responsePre.className = 'text-[11px] p-4 rounded-xl bg-slate-950 border border-white/5 overflow-x-auto max-h-[350px] text-amber-400 font-mono';
                
                mediaPreview.classList.remove('hidden');
                mediaPreview.innerHTML = `
                    <div class="text-xs font-bold text-slate-400 border-b border-white/5 pb-2 w-full text-center uppercase tracking-wider">Audio Output Stream</div>
                    <audio src="${requestUrl}" controls class="w-full max-w-md mt-1"></audio>
                `;
                showToast(i18n[currentLang].toastRequestSuccess, 'success');
            } else {
                const textData = await res.text();
                responsePre.textContent = textData.substring(0, 5000) + (textData.length > 5000 ? '\n... [Truncated due to size]' : '');
                responsePre.className = 'text-[11px] p-4 rounded-xl bg-slate-950 border border-white/5 overflow-x-auto max-h-[350px] text-slate-300 font-mono scrollbar-hide';
                showToast(i18n[currentLang].toastRequestSuccess, 'success');
            }
        })
        .catch(err => {
            const endTime = performance.now();
            runtimeSpan.textContent = `${Math.round(endTime - startTime)}ms`;
            responsePre.textContent = `Error: ${err.message}\nPossible network error, connection refusal, or invalid endpoint handler.`;
            responsePre.className = 'text-[11px] p-4 rounded-xl bg-slate-950 border border-white/5 overflow-x-auto max-h-[350px] text-rose-400 font-mono';
            showToast(i18n[currentLang].toastRequestFailed, 'error');
        })
        .finally(() => {
            isRequestInProgress = false;
        });
}

function handleMediaAutopreview(data, container) {
    if (!data || typeof data !== 'object') return;
    
    // Cari field target media potensial secara rekursif singkat
    let mediaUrl = null;
    let type = null;
    
    const targets = ['url', 'result', 'link', 'file', 'image', 'audio', 'video', 'output'];
    
    for (let key of targets) {
        if (data[key] && typeof data[key] === 'string' && (data[key].startsWith('http://') || data[key].startsWith('https://'))) {
            mediaUrl = data[key];
            break;
        }
    }
    
    if (!mediaUrl && data.result && typeof data.result === 'object') {
        for (let key of targets) {
            if (data.result[key] && typeof data.result[key] === 'string' && (data.result[key].startsWith('http://') || data.result[key].startsWith('https://'))) {
                mediaUrl = data.result[key];
                break;
            }
        }
    }

    if (!mediaUrl) return;

    const lower = mediaUrl.toLowerCase();
    if (lower.match(/\.(jpeg|jpg|gif|png|webp|svg)/)) type = 'img';
    if (lower.match(/\.(mp3|wav|ogg|m4a)/)) type = 'audio';
    if (lower.match(/\.(mp4|webm|mkv)/)) type = 'video';

    if (!type) return;

    container.classList.remove('hidden');
    container.innerHTML = `<div class="text-xs font-bold text-slate-400 border-b border-white/5 pb-2 w-full text-center uppercase tracking-wider">Detected Media Result Preview</div>`;

    if (type === 'img') {
        container.innerHTML += `
            <img src="${mediaUrl}" class="max-h-60 rounded-lg shadow border border-white/10 object-contain cursor-zoom-in bg-slate-950" onclick="openImageLightbox('${mediaUrl}')" />
            <button onclick="copyToClipboard('${mediaUrl}')" class="text-[10px] font-bold px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-all">COPY URL</button>
        `;
    } else if (type === 'audio') {
        container.innerHTML += `
            <audio src="${mediaUrl}" controls class="w-full max-w-md mt-1"></audio>
            <button onclick="copyToClipboard('${mediaUrl}')" class="text-[10px] font-bold px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-all">COPY URL</button>
        `;
    } else if (type === 'video') {
        container.innerHTML += `
            <video src="${mediaUrl}" controls class="max-h-60 rounded-lg w-full max-w-md bg-black"></video>
            <button onclick="copyToClipboard('${mediaUrl}')" class="text-[10px] font-bold px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-all">COPY URL</button>
        `;
    }
}

function clearRequest(id) {
    const responseContainer = document.getElementById(`response-container-${id}`);
    const mediaPreview = document.getElementById(`media-preview-${id}`);
    const form = document.getElementById(`form-${id}`);

    if (responseContainer) responseContainer.classList.add('hidden');
    if (mediaPreview) {
        mediaPreview.classList.add('hidden');
        mediaPreview.innerHTML = '';
    }
    if (form) {
        form.reset();
        // Kembalikan apikey bawaan setelah direset
        const keyInput = form.querySelector('input[name="apikey"]');
        if (keyInput) {
            keyInput.value = localStorage.getItem('api_key_cache') || 'arulzxd-keys';
        }
    }
}

function copyResponseText(id) {
    const pre = document.getElementById(`response-${id}`);
    if (pre) {
        copyToClipboard(pre.textContent);
    }
}

function copyToClipboard(text) {
    if (!navigator.clipboard) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast(i18n[currentLang].toastMediaCopy, 'success');
        } catch (err) {
            showToast(i18n[currentLang].toastMediaFail, 'error');
        }
        document.body.removeChild(textArea);
        return;
    }
    navigator.clipboard.writeText(text).then(() => {
        showToast(i18n[currentLang].toastMediaCopy, 'success');
    }).catch(() => {
        showToast(i18n[currentLang].toastMediaFail, 'error');
    });
}

function openImageLightbox(src) {
    const lightbox = document.getElementById('imageLightbox');
    const img = document.getElementById('lightboxImage');
    if (!lightbox || !img) return;

    img.src = src;
    lightbox.classList.remove('hidden');
    setTimeout(() => {
        lightbox.classList.add('show-lightbox');
    }, 10);
    document.body.style.overflow = 'hidden';
}

function closeImageLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    if (!lightbox) return;

    lightbox.classList.remove('show-lightbox');
    setTimeout(() => {
        lightbox.classList.add('hidden');
    }, 300);
    document.body.style.overflow = '';
}

function setupFilterListeners() {
    const filterButtons = document.querySelectorAll('#categoryFilters .filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            activeCategory = this.getAttribute('data-category');
            loadApis();
            performSearch();
        });
    });
}

function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const noResults = document.getElementById('noResults');
    let matchingCount = 0;

    allApiElements.forEach(item => {
        const name = item.getAttribute('data-name');
        const path = item.getAttribute('data-path');
        const desc = item.getAttribute('data-desc');

        const matchesQuery = !query || name.includes(query) || path.includes(query) || desc.includes(query);
        
        if (matchesQuery) {
            item.classList.remove('hidden');
            matchingCount++;
        } else {
            item.classList.add('hidden');
        }
    });

    // Sembunyikan bagian container utama (kategori) yang kosong akibat filter pencarian
    const categoryPanels = document.querySelectorAll('#apiList > div');
    categoryPanels.forEach(panel => {
        const totalItems = panel.querySelectorAll('.api-item').length;
        const hiddenItems = panel.querySelectorAll('.api-item.hidden').length;
        if (totalItems === hiddenItems) {
            panel.classList.add('hidden');
        } else {
            panel.classList.remove('hidden');
        }
    });

    if (matchingCount === 0 && allApiElements.length > 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
    }
}

// ==================== RADIO MUSIC PLAYER CORE FUNCTIONALITY ====================
function initRadioMusicPlayer() {
    const playlistData = window.musicPlaylistData || [];
    if (!playlistData.length) return;

    let currentTrackIdx = 0;
    let isPlaying = false;
    const audioObj = new Audio();

    const playBtn = document.getElementById('musicPlayBtn');
    const prevBtn = document.getElementById('musicPrevBtn');
    const nextBtn = document.getElementById('musicNextBtn');
    const titleEl = document.getElementById('musicTitle');
    const artistEl = document.getElementById('musicArtist');
    const coverEl = document.getElementById('musicCover');
    const progressBg = document.getElementById('musicProgressContainer');
    const progressBar = document.getElementById('musicProgressBar');
    const timeCurrent = document.getElementById('musicTimeCurrent');
    const timeTotal = document.getElementById('musicTimeTotal');
    const statusLabel = document.getElementById('musicStatus');

    function formatTime(secs) {
        if (isNaN(secs)) return "00:00";
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = Math.floor(secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function loadTrack(idx) {
        const track = playlistData[idx];
        audioObj.src = track.url;
        titleEl.textContent = track.title;
        artistEl.textContent = track.artist;
        coverEl.src = track.cover;
        progressBar.style.width = '0%';
        timeCurrent.textContent = '00:00';
        timeTotal.textContent = '00:00';
    }

    function playTrack() {
        audioObj.play().then(() => {
            isPlaying = true;
            playBtn.textContent = 'PAUSE';
            playBtn.classList.add('bg-cyan-500/20');
            statusLabel.textContent = 'PLAYING';
            statusLabel.className = 'text-[10px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-bold uppercase tracking-wide';
        }).catch(err => {
            console.error("Audio playback error:", err);
            statusLabel.textContent = 'ERROR';
        });
    }

    function pauseTrack() {
        audioObj.pause();
        isPlaying = false;
        playBtn.textContent = 'PLAY';
        playBtn.classList.remove('bg-cyan-500/20');
        statusLabel.textContent = 'PAUSED';
        statusLabel.className = 'text-[10px] px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full font-bold uppercase tracking-wide';
    }

    playBtn.addEventListener('click', () => {
        if (isPlaying) pauseTrack();
        else playTrack();
    });

    prevBtn.addEventListener('click', () => {
        currentTrackIdx = (currentTrackIdx - 1 + playlistData.length) % playlistData.length;
        loadTrack(currentTrackIdx);
        if (isPlaying) playTrack();
    });

    nextBtn.addEventListener('click', () => {
        currentTrackIdx = (currentTrackIdx + 1) % playlistData.length;
        loadTrack(currentTrackIdx);
        if (isPlaying) playTrack();
    });

    audioObj.addEventListener('timeupdate', () => {
        if (!audioObj.duration) return;
        const pct = (audioObj.currentTime / audioObj.duration) * 100;
        progressBar.style.width = `${pct}%`;
        timeCurrent.textContent = formatTime(audioObj.currentTime);
        timeTotal.textContent = formatTime(audioObj.duration);
    });

    audioObj.addEventListener('ended', () => {
        currentTrackIdx = (currentTrackIdx + 1) % playlistData.length;
        loadTrack(currentTrackIdx);
        playTrack();
    });

    progressBg.addEventListener('click', (e) => {
        if (!audioObj.duration) return;
        const rect = progressBg.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        audioObj.currentTime = (clickX / width) * audioObj.duration;
    });

    // Inisialisasi lagu pertama
    loadTrack(currentTrackIdx);
}

// DomContentLoaded Listener
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initBatteryDetection();
    initDigitalClock();
    initRadioMusicPlayer();

    // Setup Drawer menu sidebar
    const bioMenuBtn = document.getElementById('bioMenuBtn');
    const closeBioMenu = document.getElementById('closeBioMenu');
    const bioDropdown = document.getElementById('bioDropdown');
    const menuOverlay = document.getElementById('menuOverlay');
    const closeMenuBtn = document.getElementById('closeBioMenu');

    function closeSidebarMenu() {
        bioDropdown.classList.add('translate-x-full');
        menuOverlay.classList.add('hidden');
    }

    if (bioMenuBtn && bioDropdown && menuOverlay) {
        bioMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            bioDropdown.classList.remove('translate-x-full');
            menuOverlay.classList.remove('hidden');
        });
        if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeSidebarMenu);
        menuOverlay.addEventListener('click', closeSidebarMenu);
        bioDropdown.addEventListener('click', (e) => { e.stopPropagation(); });
    }

    // Ambil data endpoints dari server api list
    fetch('/api/apilist')
        .then(res => res.json())
        .then(data => {
            apiData = data;
            loadApis();
        })
        .catch(err => {
            document.getElementById('apiList').innerHTML = `<div class="text-center p-8 bg-red-900/20 border border-red-700 rounded-lg"><div class="text-4xl mb-4">⚠️</div><h3 class="font-bold text-lg mb-2">Failed to load API data</h3></div>`;
        });

    const uploaderBtn = document.getElementById('uploaderMenuBtn'); 
    const pastebinBtn = document.getElementById('pastebinMenuBtn'); 

    if (uploaderBtn) {
        uploaderBtn.addEventListener('click', () => {
            window.open('https://arulz-uploader.vercel.app/', '_blank'); 
        });
    }

    if (pastebinBtn) {
        pastebinBtn.addEventListener('click', () => {
            window.open('https://arulz-pastecode.vercel.app/', '_blank');
        });
    }

    // Event Listener untuk Lightbox preview gambar close
    const lightbox = document.getElementById('imageLightbox');
    if (lightbox) {
        lightbox.addEventListener('click', closeImageLightbox);
    }
});

themeToggleBtn.addEventListener('click', toggleTheme);

let searchTimeout;
document.getElementById('searchInput').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 150);
});