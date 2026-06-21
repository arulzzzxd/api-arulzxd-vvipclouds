const BASE_URL = window.location.origin; //[span_33](start_span)[span_33](end_span)
let isRequestInProgress = false; //[span_34](start_span)[span_34](end_span)
let apiData = null; //[span_35](start_span)[span_35](end_span)
let currentTheme = 'dark'; //[span_36](start_span)[span_36](end_span)
let currentLang = 'id'; //[span_37](start_span)[span_37](end_span)
let allApiElements = []; //[span_38](start_span)[span_38](end_span)
let totalEndpoints = 0; //[span_39](start_span)[span_39](end_span)
let totalCategories = 0; //[span_40](start_span)[span_40](end_span)
let batteryMonitor = null; //[span_41](start_span)[span_41](end_span)
let activeCategory = 'all'; //[span_42](start_span)[span_42](end_span)

// Pemetaan Ikon Kategori (SVG Kuning/Cyan)
const categoryIcons = {
    'ai': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 1 1 12 2zm-2 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm4 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>', //[span_43](start_span)[span_43](end_span)
    'download': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M12 16l-5-5h3V4h4v7h3l-5 5zm9 4H3v-2h18v2z"/></svg>', //[span_44](start_span)[span_44](end_span)
    'search': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>', //[span_45](start_span)[span_45](end_span)
    'image': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>', //[span_46](start_span)[span_46](end_span)
    'tools': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.1L9 6 6 9 1.8 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>', //[span_47](start_span)[span_47](end_span)
    'maker': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>', //[span_48](start_span)[span_48](end_span)
    'stalker': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>', //[span_49](start_span)[span_49](end_span)
    'canvas': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>', //[span_50](start_span)[span_50](end_span)
    'security': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>', //[span_51](start_span)[span_51](end_span)
    'news': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 16H5V5h14v14zm-9-2h8v-2h-8v2zm0-4h8v-2h-8v2zm0-4h8V7h-8v2zm-4 8h2v-8H6v8z"/></svg>', //[span_52](start_span)[span_52](end_span)
    'random': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>', //[span_53](start_span)[span_53](end_span)
    'islam': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>', //[span_54](start_span)[span_54](end_span)
    'default': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>' //[span_55](start_span)[span_55](end_span)
};

const themeToggleBtn = document.getElementById('themeToggle');
const body = document.body;
const themeBg = document.getElementById('themeBg');

const i18n = {
    id: {
        searchPlaceholder: "Cari endpoint berdasarkan nama, path, atau kategori...", //[span_56](start_span)[span_56](end_span)
        noResultsTitle: "Endpoint tidak ditemukan", //[span_57](start_span)[span_57](end_span)
        noResultsDesc: "Coba gunakan kata kunci lain", //[span_58](start_span)[span_58](end_span)
        batteryTitle: "Baterai Anda", //[span_59](start_span)[span_59](end_span)
        endpointsTitle: "Total Endpoint", //[span_60](start_span)[span_60](end_span)
        categoriesTitle: "Total Kategori", //[span_61](start_span)[span_61](end_span)
        batteryDetecting: "Mendeteksi...", //[span_62](start_span)[span_62](end_span)
        batteryCharging: "Mengisi Daya", //[span_63](start_span)[span_63](end_span)
        batteryFull: "Penuh", //[span_64](start_span)[span_64](end_span)
        batteryDischarging: "Menguras Daya", //[span_65](start_span)[span_65](end_span)
        batteryLeft: "tersisa", //[span_66](start_span)[span_66](end_span)
        endpointsCount: "endpoints", //[span_67](start_span)[span_67](end_span)
        btnExecute: "Eksekusi", //[span_68](start_span)[span_68](end_span)
        btnClear: "Bersihkan", //[span_69](start_span)[span_69](end_span)
        toastMediaCopy: "Media URL disalin ke papan klip!", //[span_70](start_span)[span_70](end_span)
        toastMediaFail: "Gagal menyalin URL", //[span_71](start_span)[span_71](end_span)
        endpointNotAvailable: "⚠️ Endpoint sedang error / dalam perbaikan dan tidak bisa digunakan.",
        endpointPremiumBlock: "⭐ Parameter Kustom Terdeteksi! Gunakan Premium API Key untuk mengeksekusi.",
        toastRequestWait: "Harap tunggu permintaan saat ini selesai", //[span_72](start_span)[span_72](end_span)
        toastRequestSuccess: "Permintaan berhasil diselesaikan!", //[span_73](start_span)[span_73](end_span)
        toastRequestFailed: "Permintaan gagal!", //[span_74](start_span)[span_74](end_span)
        toastApiKeyCopy: "API Key Free berhasil disalin!"
    },
    en: {
        searchPlaceholder: "Search endpoints by name, path, or category...", //[span_75](start_span)[span_75](end_span)
        noResultsTitle: "No endpoints found", //[span_76](start_span)[span_76](end_span)
        noResultsDesc: "Try a different search term", //[span_77](start_span)[span_77](end_span)
        batteryTitle: "Your Battery", //[span_78](start_span)[span_78](end_span)
        endpointsTitle: "Total Endpoints", //[span_79](start_span)[span_79](end_span)
        categoriesTitle: "Total Categories", //[span_80](start_span)[span_80](end_span)
        batteryDetecting: "Detecting...", //[span_81](start_span)[span_81](end_span)
        batteryCharging: "Charging", //[span_82](start_span)[span_82](end_span)
        batteryFull: "Fully charged", //[span_83](start_span)[span_83](end_span)
        batteryDischarging: "Discharging", //[span_84](start_span)[span_84](end_span)
        batteryLeft: "left", //[span_85](start_span)[span_85](end_span)
        endpointsCount: "endpoints", //[span_86](start_span)[span_86](end_span)
        btnExecute: "Execute", //[span_87](start_span)[span_87](end_span)
        btnClear: "Clear", //[span_88](start_span)[span_88](end_span)
        toastMediaCopy: "Media URL copied to clipboard!", //[span_89](start_span)[span_89](end_span)
        toastMediaFail: "Failed to copy URL", //[span_90](start_span)[span_90](end_span)
        endpointNotAvailable: "⚠️ Endpoint is currently broken or under maintenance.",
        endpointPremiumBlock: "⭐ Custom Parameter Detected! Use Premium API Key to execute.",
        toastRequestWait: "Please wait for current request", //[span_91](start_span)[span_91](end_span)
        toastRequestSuccess: "Request completed successfully!", //[span_92](start_span)[span_92](end_span)
        toastRequestFailed: "Request failed!", //[span_93](start_span)[span_93](end_span)
        toastApiKeyCopy: "Free API Key copied to clipboard!"
    }
};

function updateThemeBackground(theme) {
    if (themeBg) { //[span_94](start_span)[span_94](end_span)
        themeBg.className = "fixed inset-0 -z-50 transition-all duration-300"; //[span_95](start_span)[span_95](end_span)
        if (theme === 'light') { //[span_96](start_span)[span_96](end_span)
            document.body.style.backgroundColor = "#ffffff"; //[span_97](start_span)[span_97](end_span)
            themeBg.style.backgroundColor = "#ffffff"; //[span_98](start_span)[span_98](end_span)
            themeBg.style.backgroundImage = "radial-gradient(#cbd5e1 1.5px, transparent 1.5px)"; //[span_99](start_span)[span_99](end_span)
            themeBg.style.backgroundSize = "24px 24px"; //[span_100](start_span)[span_100](end_span)
        } else {
            document.body.style.backgroundColor = "#030712"; //[span_101](start_span)[span_101](end_span)
            themeBg.style.backgroundColor = "#030712"; //[span_102](start_span)[span_102](end_span)
            themeBg.style.backgroundImage = "radial-gradient(rgba(255, 255, 255, 0.12) 1.5px, transparent 1.5px)"; //[span_103](start_span)[span_103](end_span)
            themeBg.style.backgroundSize = "24px 24px"; //[span_104](start_span)[span_104](end_span)
        }
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark'; //[span_105](start_span)[span_105](end_span)
    currentTheme = savedTheme; //[span_106](start_span)[span_106](end_span)
    
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon'); //[span_107](start_span)[span_107](end_span)
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon'); //[span_108](start_span)[span_108](end_span)
    
    if (savedTheme === 'light') { //[span_109](start_span)[span_109](end_span)
        body.classList.add('light-mode'); //[span_110](start_span)[span_110](end_span)
        body.classList.remove('text-slate-100'); //[span_111](start_span)[span_111](end_span)
        body.classList.add('text-slate-900'); //[span_112](start_span)[span_112](end_span)
        themeToggleDarkIcon?.classList.add('hidden'); //[span_113](start_span)[span_113](end_span)
        themeToggleLightIcon?.classList.remove('hidden'); //[span_114](start_span)[span_114](end_span)
    } else {
        body.classList.remove('light-mode'); //[span_115](start_span)[span_115](end_span)
        body.classList.remove('text-slate-900'); //[span_116](start_span)[span_116](end_span)
        body.classList.add('text-slate-100'); //[span_117](start_span)[span_117](end_span)
        themeToggleDarkIcon?.classList.remove('hidden'); //[span_118](start_span)[span_118](end_span)
        themeToggleLightIcon?.classList.add('hidden'); //[span_119](start_span)[span_119](end_span)
    }
    updateThemeBackground(currentTheme); //[span_120](start_span)[span_120](end_span)
    updateSocialBadges(); //[span_121](start_span)[span_121](end_span)
}

function toggleTheme() {
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon'); //[span_122](start_span)[span_122](end_span)
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon'); //[span_123](start_span)[span_123](end_span)
    
    if (body.classList.contains('light-mode')) { //[span_124](start_span)[span_124](end_span)
        body.classList.remove('light-mode'); //[span_125](start_span)[span_125](end_span)
        body.classList.remove('text-slate-900'); //[span_126](start_span)[span_126](end_span)
        body.classList.add('text-slate-100'); //[span_127](start_span)[span_127](end_span)
        themeToggleDarkIcon?.classList.remove('hidden'); //[span_128](start_span)[span_128](end_span)
        themeToggleLightIcon?.classList.add('hidden'); //[span_129](start_span)[span_129](end_span)
        currentTheme = 'dark'; //[span_130](start_span)[span_130](end_span)
    } else {
        body.classList.add('light-mode'); //[span_131](start_span)[span_131](end_span)
        body.classList.remove('text-slate-100'); //[span_132](start_span)[span_132](end_span)
        body.classList.add('text-slate-900'); //[span_133](start_span)[span_133](end_span)
        themeToggleDarkIcon?.classList.add('hidden'); //[span_134](start_span)[span_134](end_span)
        themeToggleLightIcon?.classList.remove('hidden'); //[span_135](start_span)[span_135](end_span)
        currentTheme = 'light'; //[span_136](start_span)[span_136](end_span)
    }
    
    localStorage.setItem('theme', currentTheme); //[span_137](start_span)[span_137](end_span)
    updateThemeBackground(currentTheme); //[span_138](start_span)[span_138](end_span)
    updateSocialBadges(); //[span_139](start_span)[span_139](end_span)
    if (apiData) loadApis(); //[span_140](start_span)[span_140](end_span)
}

function setLanguage(lang) {
    currentLang = lang; //[span_141](start_span)[span_141](end_span)
    localStorage.setItem('lang', lang); //[span_142](start_span)[span_142](end_span)
    
    document.getElementById('lang-id').classList.toggle('active', lang === 'id'); //[span_143](start_span)[span_143](end_span)
    document.getElementById('lang-en').classList.toggle('active', lang === 'en'); //[span_144](start_span)[span_144](end_span)
    
    document.getElementById('searchInput').placeholder = i18n[lang].searchPlaceholder; //[span_145](start_span)[span_145](end_span)
    document.getElementById('no-results-title').textContent = i18n[lang].noResultsTitle; //[span_146](start_span)[span_146](end_span)
    document.getElementById('no-results-desc').textContent = i18n[lang].noResultsDesc; //[span_147](start_span)[span_147](end_span)
    document.getElementById('stat-battery-title').textContent = i18n[lang].batteryTitle; //[span_148](start_span)[span_148](end_span)
    document.getElementById('stat-endpoints-title').textContent = i18n[lang].endpointsTitle; //[span_149](start_span)[span_149](end_span)
    document.getElementById('stat-categories-title').textContent = i18n[lang].categoriesTitle; //[span_150](start_span)[span_150](end_span)
    
    if (batteryMonitor) { //[span_151](start_span)[span_151](end_span)
        window.dispatchEvent(new Event('batteryupdate-hook')); //[span_152](start_span)[span_152](end_span)
    }

    updateClockAndDate(); // Jalankan pembaharuan waktu saat bahasa berganti
    
    if (apiData) loadApis(); //[span_153](start_span)[span_153](end_span)
}

function updateSocialBadges() {
    const isLightMode = body.classList.contains('light-mode'); //[span_154](start_span)[span_154](end_span)
    const socialBadges = document.querySelectorAll('.social-badge > div'); //[span_155](start_span)[span_155](end_span)
    
    socialBadges.forEach(badge => {
        if (isLightMode) { //[span_156](start_span)[span_156](end_span)
            badge.className = 'px-4 py-2 rounded-xl text-xs font-bold transition-colors text-center border bg-white/80 text-slate-900 hover:bg-slate-100 border-black/10 shadow-sm'; //[span_157](start_span)[span_157](end_span)
        } else {
            badge.className = 'px-4 py-2 rounded-xl text-xs font-bold transition-colors text-center border bg-slate-900/40 text-slate-200 hover:bg-slate-800/60 border-white/10'; //[span_158](start_span)[span_158](end_span)
        }
    });
}

function initBatteryDetection() {
    const batteryLevelElement = document.getElementById('batteryLevel'); //[span_159](start_span)[span_159](end_span)
    const batteryPercentageElement = document.getElementById('batteryPercentage'); //[span_160](start_span)[span_160](end_span)
    const batteryStatusElement = document.getElementById('batteryStatus'); //[span_161](start_span)[span_161](end_span)
    const batteryContainer = document.getElementById('batteryContainer'); //[span_162](start_span)[span_162](end_span)
    
    if ('getBattery' in navigator) { //[span_163](start_span)[span_163](end_span)
        navigator.getBattery().then(function(battery) {
            function updateBatteryInfo() {
                const level = battery.level * 100; //[span_164](start_span)[span_164](end_span)
                const isCharging = battery.charging; //[span_165](start_span)[span_165](end_span)
                const roundedLevel = Math.round(level); //[span_166](start_span)[span_166](end_span)
                
                batteryPercentageElement.textContent = `${roundedLevel}%`; //[span_167](start_span)[span_167](end_span)
                batteryLevelElement.style.width = `${level}%`; //[span_168](start_span)[span_168](end_span)
                
                if (level > 60) { //[span_169](start_span)[span_169](end_span)
                    batteryLevelElement.className = 'battery-level bg-green-500'; //[span_170](start_span)[span_170](end_span)
                } else if (level > 20) { //[span_171](start_span)[span_171](end_span)
                    batteryLevelElement.className = 'battery-level bg-yellow-500'; //[span_172](start_span)[span_172](end_span)
                } else {
                    batteryLevelElement.className = 'battery-level bg-red-500'; //[span_173](start_span)[span_173](end_span)
                }
                
                if (isCharging) { //[span_174](start_span)[span_174](end_span)
                    batteryContainer.classList.add('charging'); //[span_175](start_span)[span_175](end_span)
                    batteryStatusElement.textContent = i18n[currentLang].batteryCharging; //[span_176](start_span)[span_176](end_span)
                } else {
                    batteryContainer.classList.remove('charging'); //[span_177](start_span)[span_177](end_span)
                    if (battery.dischargingTime === Infinity) { //[span_178](start_span)[span_178](end_span)
                        batteryStatusElement.textContent = i18n[currentLang].batteryFull; //[span_179](start_span)[span_179](end_span)
                    } else {
                        batteryStatusElement.textContent = i18n[currentLang].batteryDischarging; //[span_180](start_span)[span_180](end_span)
                    }
                }
            }
            
            updateBatteryInfo(); //[span_181](start_span)[span_181](end_span)
            battery.addEventListener('levelchange', updateBatteryInfo); //[span_182](start_span)[span_182](end_span)
            battery.addEventListener('chargingchange', updateBatteryInfo); //[span_183](start_span)[span_183](end_span)
            window.addEventListener('batteryupdate-hook', updateBatteryInfo); //[span_184](start_span)[span_184](end_span)
            batteryMonitor = battery; //[span_185](start_span)[span_185](end_span)
            
        }).catch(function() { fallbackBattery(); }); //[span_186](start_span)[span_186](end_span)
    } else {
        fallbackBattery(); //[span_187](start_span)[span_187](end_span)
    }
    
    function fallbackBattery() {
        batteryStatusElement.textContent = 'Simulated'; //[span_188](start_span)[span_188](end_span)
        batteryPercentageElement.textContent = '85%'; //[span_189](start_span)[span_189](end_span)
        batteryLevelElement.style.width = '85%'; //[span_190](start_span)[span_190](end_span)
        batteryLevelElement.className = 'battery-level bg-green-400'; //[span_191](start_span)[span_191](end_span)
    }
}

function cleanupBatteryMonitor() {
    if (batteryMonitor) batteryMonitor = null; //[span_192](start_span)[span_192](end_span)
}

// ==================== FITUR JAM, HARI, TANGGAL SESUAI BAHASA ====================
function updateClockAndDate() {
    if (typeof moment === 'undefined') return;
    
    const clockElement = document.getElementById('liveClock');
    const dateElement = document.getElementById('liveDate');
    
    if (!clockElement || !dateElement) return;

    const now = moment().tz("Asia/Jakarta");
    clockElement.textContent = now.format('HH:mm:ss');

    // Menyesuaikan bahasa lokal hari, tanggal, bulan, dan tahun
    const targetLang = currentLang === 'id' ? 'id' : 'en';
    dateElement.textContent = now.locale(targetLang).format('dddd, D MMMM YYYY');
}

function initDigitalClock() {
    updateClockAndDate();
    setInterval(updateClockAndDate, 1000);
}

// ==================== FITUR COPY APIKEY FREE DI MENU ====================
function copyFreeKey() {
    const keyText = document.getElementById('freeApiKeyContainer').textContent;
    navigator.clipboard.writeText(keyText).then(() => {
        showToast(i18n[currentLang].toastApiKeyCopy);
    }).catch(() => {
        showToast('Gagal menyalin text', true); //[span_193](start_span)[span_193](end_span)
    });
}

function updateTotalEndpoints() { document.getElementById('totalEndpoints').textContent = totalEndpoints; } //[span_194](start_span)[span_194](end_span)
function updateTotalCategories() { document.getElementById('totalCategories').textContent = totalCategories; } //[span_195](start_span)[span_195](end_span)

function showToast(message, isError = false) {
    const toast = document.getElementById('toast'); //[span_196](start_span)[span_196](end_span)
    const toastMessage = document.getElementById('toastMessage'); //[span_197](start_span)[span_197](end_span)
    const toastIcon = document.getElementById('toastIcon'); //[span_198](start_span)[span_198](end_span)
    
    toastMessage.textContent = message; //[span_199](start_span)[span_199](end_span)
    if (isError) { //[span_200](start_span)[span_200](end_span)
        toastIcon.innerHTML = '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>'; //[span_201](start_span)[span_201](end_span)
    } else {
        toastIcon.innerHTML = '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>'; //[span_202](start_span)[span_202](end_span)
    }
    toast.classList.add('show'); //[span_203](start_span)[span_203](end_span)
    setTimeout(() => toast.classList.remove('show'), 3000); //[span_204](start_span)[span_204](end_span)
}

function copyText(text, type = 'path') {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`${type} berhasil disalin ke papan klip!`); //[span_205](start_span)[span_205](end_span)
    }).catch(() => {
        showToast('Gagal menyalin text', true); //[span_206](start_span)[span_206](end_span)
    });
}

function copyFromElement(elementId, type) {
    const el = document.getElementById(elementId); //[span_207](start_span)[span_207](end_span)
    if (el) { //[span_208](start_span)[span_208](end_span)
        copyText(el.innerText || el.textContent, type); //[span_209](start_span)[span_209](end_span)
    }
}

function updateLivePreview(catIdx, epIdx, method, basePath) {
    const form = document.getElementById(`form-${catIdx}-${epIdx}`); //[span_210](start_span)[span_210](end_span)
    if (!form) return; //[span_211](start_span)[span_211](end_span)

    const formData = new FormData(form); //[span_212](start_span)[span_212](end_span)
    const params = new URLSearchParams(); //[span_213](start_span)[span_213](end_span)
    for (const [key, value] of formData.entries()) {
        if (value) params.append(key, value); //[span_214](start_span)[span_214](end_span)
    }

    const queryStr = params.toString(); //[span_215](start_span)[span_215](end_span)
    const finalUrl = queryStr ? `${BASE_URL}${basePath}?${queryStr}` : `${BASE_URL}${basePath}`; //[span_216](start_span)[span_216](end_span)
    
    const urlContainer = document.getElementById(`live-url-${catIdx}-${epIdx}`); //[span_217](start_span)[span_217](end_span)
    const curlContainer = document.getElementById(`live-curl-${catIdx}-${epIdx}`); //[span_218](start_span)[span_218](end_span)

    if (urlContainer) urlContainer.textContent = finalUrl; //[span_219](start_span)[span_219](end_span)
    if (curlContainer) { //[span_220](start_span)[span_220](end_span)
        if (method === 'GET') { //[span_221](start_span)[span_221](end_span)
            curlContainer.textContent = `curl -X GET "${finalUrl}"`; //[span_222](start_span)[span_222](end_span)
        } else {
            const bodyParams = []; //[span_223](start_span)[span_223](end_span)
            for (const [key, value] of formData.entries()) {
                if (value) bodyParams.push(`"${key}": "${value}"`); //[span_224](start_span)[span_224](end_span)
            }
            const dataString = bodyParams.length ? ` -H "Content-Type: application/json" -d '{${bodyParams.join(', ')}}'` : ''; //[span_225](start_span)[span_225](end_span)
            curlContainer.textContent = `curl -X ${method} "${BASE_URL}${basePath}"${dataString}`; //[span_226](start_span)[span_226](end_span)
        }
    }
}

function toggleCategory(index) {
    const content = document.getElementById(`cat-${index}`); //[span_227](start_span)[span_227](end_span)
    const icon = document.getElementById(`cat-icon-${index}`); //[span_228](start_span)[span_228](end_span)
    content.classList.toggle('hidden'); //[span_229](start_span)[span_229](end_span)
    icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)'; //[span_230](start_span)[span_230](end_span)
}

function closeSidebarMenu() {
    const bioDropdown = document.getElementById('bioDropdown'); //[span_231](start_span)[span_231](end_span)
    const menuOverlay = document.getElementById('menuOverlay'); //[span_232](start_span)[span_232](end_span)
    if (bioDropdown) bioDropdown.style.transform = 'translateX(100%)'; //[span_233](start_span)[span_233](end_span)
    if (menuOverlay) menuOverlay.classList.add('hidden'); //[span_234](start_span)[span_234](end_span)
}

function toggleEndpoint(catIdx, epIdx) {
    const content = document.getElementById(`ep-${catIdx}-${epIdx}`); //[span_235](start_span)[span_235](end_span)
    const icon = document.getElementById(`ep-icon-${catIdx}-${epIdx}`); //[span_236](start_span)[span_236](end_span)
    content.classList.toggle('hidden'); //[span_237](start_span)[span_237](end_span)
    icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)'; //[span_238](start_span)[span_238](end_span)
}

function getContentType(url, contentType) {
    if (contentType) { //[span_239](start_span)[span_239](end_span)
        if (contentType.includes('image/')) return 'image'; //[span_240](start_span)[span_240](end_span)
        if (contentType.includes('video/')) return 'video'; //[span_241](start_span)[span_241](end_span)
        if (contentType.includes('audio/')) return 'audio'; //[span_242](start_span)[span_242](end_span)
        if (contentType.includes('application/pdf')) return 'pdf'; //[span_243](start_span)[span_243](end_span)
    }
    if (url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg')) return 'image'; //[span_244](start_span)[span_244](end_span)
    if (url.includes('.mp4')) return 'video'; //[span_245](start_span)[span_245](end_span)
    if (url.includes('.mp3')) return 'audio'; //[span_246](start_span)[span_246](end_span)
    if (url.includes('.pdf')) return 'pdf'; //[span_247](start_span)[span_247](end_span)
    return 'unknown'; //[span_248](start_span)[span_248](end_span)
}

function createMediaPreview(url, contentType, originalUrl = '') {
    const type = getContentType(url, contentType); //[span_249](start_span)[span_249](end_span)
    let previewHtml = ''; //[span_250](start_span)[span_250](end_span)
    
    switch(type) {
        case 'image':
            // Ditambahkan class cursor-zoom-in untuk memberi tanda gambar dapat diklik perbesar
            previewHtml = `<div class="media-preview"><img src="${url}" class="media-image cursor-zoom-in rounded-lg max-h-64 object-cover" alt="Response Image"></div>`;
            break;
        case 'video':
            previewHtml = `<div class="media-preview"><video controls class="media-iframe"><source src="${url}">Your browser does not support the video tag.</video></div>`; //[span_251](start_span)[span_251](end_span)
            break;
        case 'audio':
            previewHtml = `<div class="media-preview"><audio controls class="w-full"><source src="${url}">Your browser does not support the audio tag.</audio></div>`; //[span_252](start_span)[span_252](end_span)
            break;
        default:
            previewHtml = `<div class="media-preview"><iframe src="${url}" class="media-iframe" frameborder="0"></iframe></div>`; //[span_253](start_span)[span_253](end_span)
    }
    
    const isLightMode = body.classList.contains('light-mode'); //[span_254](start_span)[span_254](end_span)
    const btnClass = isLightMode //[span_255](start_span)[span_255](end_span)
        ? 'px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5' //[span_256](start_span)[span_256](end_span)
        : 'px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5'; //[span_257](start_span)[span_257](end_span)
    
    return `<div class="w-full">${previewHtml}<div class="flex gap-2 mt-3"><button type="button" onclick="copyText('${originalUrl || url}', 'Media URL')" class="${btnClass}">📋 Copy URL</button><a href="${url}" download class="${btnClass}">📥 Download</a></div></div>`; //[span_258](start_span)[span_258](end_span)
}

async function executeRequest(e, catIdx, epIdx, method, path, status) {
    e.preventDefault(); //[span_259](start_span)[span_259](end_span)

    // Blokir aksi eksekusi jika status endpoint adalah error atau perbaikan
    if (status === 'error' || status === 'perbaikan') {
        showToast(i18n[currentLang].endpointNotAvailable, true);
        return;
    }

    if (isRequestInProgress) {
        showToast(i18n[currentLang].toastRequestWait, true); //[span_260](start_span)[span_260](end_span)
        return; //[span_261](start_span)[span_261](end_span)
    }

    const form = document.getElementById(`form-${catIdx}-${epIdx}`); //[span_262](start_span)[span_262](end_span)
    const responseDiv = document.getElementById(`response-${catIdx}-${epIdx}`); //[span_263](start_span)[span_263](end_span)
    const responseContent = document.getElementById(`response-content-${catIdx}-${epIdx}`); //[span_264](start_span)[span_264](end_span)
    const executeBtn = form.querySelector('button[type="submit"]'); //[span_265](start_span)[span_265](end_span)
    
    let spinner = executeBtn.querySelector('.local-spinner'); //[span_266](start_span)[span_266](end_span)
    if (!spinner) { //[span_267](start_span)[span_267](end_span)
        spinner = document.createElement('span'); //[span_268](start_span)[span_268](end_span)
        spinner.className = 'local-spinner ml-2'; //[span_269](start_span)[span_269](end_span)
        executeBtn.appendChild(spinner); //[span_270](start_span)[span_270](end_span)
    }
    
    const formData = new FormData(form); //[span_271](start_span)[span_271](end_span)
    const params = new URLSearchParams(); //[span_272](start_span)[span_272](end_span)
    for (const [key, value] of formData.entries()) {
        if (value) params.append(key, value); //[span_273](start_span)[span_273](end_span)
    }

    // Blokir eksekusi Premium jika pengguna premium memasukkan apikey gratis pada endpoint premium custom
    if (status === 'premium' && params.get('apikey') === 'arulzxd-keys') {
        showToast(i18n[currentLang].endpointPremiumBlock, true);
        return;
    }

    isRequestInProgress = true; //[span_274](start_span)[span_274](end_span)
    executeBtn.disabled = true; //[span_275](start_span)[span_275](end_span)
    executeBtn.classList.add('btn-loading'); //[span_276](start_span)[span_276](end_span)
    spinner.classList.add('active'); //[span_277](start_span)[span_277](end_span)

    const fullPath = `${BASE_URL}${path.split('?')[0]}?${params.toString()}`; //[span_278](start_span)[span_278](end_span)
    let curlCommand = `curl -X ${method} "${fullPath}"`; //[span_279](start_span)[span_279](end_span)
    if (method !== 'GET') { //[span_280](start_span)[span_280](end_span)
        curlCommand = `curl -X ${method} "${BASE_URL}${path.split('?')[0]}" `; //[span_281](start_span)[span_281](end_span)
        const bodyParams = []; //[span_282](start_span)[span_282](end_span)
        for (const [key, value] of formData.entries()) {
            if (value) bodyParams.push(`"${key}": "${value}"`); //[span_283](start_span)[span_283](end_span)
        }
        if (bodyParams.length) { //[span_284](start_span)[span_284](end_span)
            curlCommand += `-H "Content-Type: application/json" -d '{${bodyParams.join(', ')}}'`; //[span_285](start_span)[span_285](end_span)
        }
    }

    responseDiv.classList.remove('hidden'); //[span_286](start_span)[span_286](end_span)
    responseContent.innerHTML = '<div class="spinner mx-auto"></div>'; //[span_287](start_span)[span_287](end_span)

    try {
        const response = await fetch(fullPath); //[span_288](start_span)[span_288](end_span)
        if (!response.ok) throw new Error(`HTTP ${response.status}`); //[span_289](start_span)[span_289](end_span)

        const contentType = response.headers.get("content-type"); //[span_290](start_span)[span_290](end_span)
        let rawResponseText = ""; //[span_291](start_span)[span_291](end_span)
        let isMedia = false; //[span_292](start_span)[span_292](end_span)

        if (contentType?.includes("application/json")) { //[span_293](start_span)[span_293](end_span)
            const data = await response.json(); //[span_294](start_span)[span_294](end_span)
            rawResponseText = JSON.stringify(data, null, 2); //[span_295](start_span)[span_295](end_span)
            responseContent.innerHTML = `<pre id="raw-text-${catIdx}-${epIdx}" class="code-font text-sm overflow-auto text-cyan-400">${rawResponseText}</pre>`; //[span_296](start_span)[span_296](end_span)
        } else if (contentType?.startsWith("image/") || contentType?.startsWith("video/") || contentType?.startsWith("audio/") || contentType?.includes("application/pdf")) { //[span_297](start_span)[span_297](end_span)
            isMedia = true; //[span_298](start_span)[span_298](end_span)
            const blob = await response.blob(); //[span_299](start_span)[span_299](end_span)
            const url = URL.createObjectURL(blob); //[span_300](start_span)[span_300](end_span)
            responseContent.innerHTML = createMediaPreview(url, contentType, fullPath); //[span_301](start_span)[span_301](end_span)
        } else {
            rawResponseText = await response.text(); //[span_302](start_span)[span_302](end_span)
            responseContent.innerHTML = `<pre id="raw-text-${catIdx}-${epIdx}" class="code-font text-sm overflow-auto">${rawResponseText}</pre>`; //[span_303](start_span)[span_303](end_span)
        }

        const isLightMode = body.classList.contains('light-mode'); //[span_304](start_span)[span_304](end_span)
        const btnStyle = isLightMode //[span_305](start_span)[span_305](end_span)
            ? 'px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-[11px] font-semibold transition-colors code-font border border-black/5' //[span_306](start_span)[span_306](end_span)
            : 'px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-semibold transition-colors code-font border border-white/5'; //[span_307](start_span)[span_307](end_span)

        const actionContainer = document.createElement('div'); //[span_308](start_span)[span_308](end_span)
        actionContainer.className = "flex flex-wrap gap-2 mb-3 border-b border-white/10 light-mode:border-slate-200 pb-3"; //[span_309](start_span)[span_309](end_span)

        const copyUrlBtn = document.createElement('button'); //[span_310](start_span)[span_310](end_span)
        copyUrlBtn.type = "button"; //[span_311](start_span)[span_311](end_span)
        copyUrlBtn.className = btnStyle; //[span_312](start_span)[span_312](end_span)
        copyUrlBtn.innerHTML = "🔗 Copy URL Request"; //[span_313](start_span)[span_313](end_span)
        copyUrlBtn.onclick = () => copyText(fullPath, "URL Request"); //[span_314](start_span)[span_314](end_span)
        actionContainer.appendChild(copyUrlBtn); //[span_315](start_span)[span_315](end_span)

        const copyCurlBtn = document.createElement('button'); //[span_316](start_span)[span_316](end_span)
        copyCurlBtn.type = "button"; //[span_317](start_span)[span_317](end_span)
        copyCurlBtn.className = btnStyle; //[span_318](start_span)[span_318](end_span)
        copyCurlBtn.innerHTML = "💻 Copy cURL"; //[span_319](start_span)[span_319](end_span)
        copyCurlBtn.onclick = () => copyText(curlCommand, "cURL Command"); //[span_320](start_span)[span_320](end_span)
        actionContainer.appendChild(copyCurlBtn); //[span_321](start_span)[span_321](end_span)

        if (!isMedia) { //[span_322](start_span)[span_322](end_span)
            const copyResponseBtn = document.createElement('button'); //[span_323](start_span)[span_323](end_span)
            copyResponseBtn.type = "button"; //[span_324](start_span)[span_324](end_span)
            copyResponseBtn.className = btnStyle; //[span_325](start_span)[span_325](end_span)
            copyResponseBtn.innerHTML = "📋 Copy Response"; //[span_326](start_span)[span_326](end_span)
            copyResponseBtn.onclick = () => copyText(rawResponseText, "Response"); //[span_327](start_span)[span_327](end_span)
            actionContainer.appendChild(copyResponseBtn); //[span_328](start_span)[span_328](end_span)
        }

        responseContent.insertBefore(actionContainer, responseContent.firstChild); //[span_329](start_span)[span_329](end_span)
        showToast(i18n[currentLang].toastRequestSuccess); //[span_330](start_span)[span_330](end_span)
    } catch (error) {
        responseContent.innerHTML = `<pre class="text-red-400 code-font text-sm">Error: ${error.message}</pre>`; //[span_331](start_span)[span_331](end_span)
        showToast(i18n[currentLang].toastRequestFailed, true); //[span_332](start_span)[span_332](end_span)
    } finally {
        isRequestInProgress = false; //[span_333](start_span)[span_333](end_span)
        executeBtn.disabled = false; //[span_334](start_span)[span_334](end_span)
        executeBtn.classList.remove('btn-loading'); //[span_335](start_span)[span_335](end_span)
        spinner.classList.remove('active'); //[span_336](start_span)[span_336](end_span)
    }
}

// ==================== FITUR BERSIHKAN RESPONSE + PARAMS INPUT ====================
function clearResponse(catIdx, epIdx) {
    const responseDiv = document.getElementById(`response-${catIdx}-${epIdx}`); //[span_337](start_span)[span_337](end_span)
    if (responseDiv) {
        responseDiv.classList.add('hidden'); //[span_338](start_span)[span_338](end_span)
    }

    const form = document.getElementById(`form-${catIdx}-${epIdx}`); //[span_339](start_span)[span_339](end_span)
    if (form) {
        form.reset(); //[span_340](start_span)[span_340](end_span)
        
        const urlContainer = document.getElementById(`live-url-${catIdx}-${epIdx}`); //[span_341](start_span)[span_341](end_span)
        if (urlContainer) {
            const basePath = urlContainer.textContent.split('?')[0]; //[span_342](start_span)[span_342](end_span)
            urlContainer.textContent = basePath; //[span_343](start_span)[span_343](end_span)
        }
        
        const curlContainer = document.getElementById(`live-curl-${catIdx}-${epIdx}`); //[span_344](start_span)[span_344](end_span)
        if (curlContainer) {
            const method = curlContainer.textContent.split(' ')[1] || 'GET'; //[span_345](start_span)[span_345](end_span)
            const baseUrl = curlContainer.textContent.split('"')[1] || ''; //[span_346](start_span)[span_346](end_span)
            curlContainer.textContent = `curl -X ${method} "${baseUrl.split('?')[0]}"`; //[span_347](start_span)[span_347](end_span)
        }
    }
}

// ==================== FITUR KLIK GAMBAR UNTUK MEMPERBESAR ====================
function initImageZoomHandler() {
    const modal = document.getElementById('imageZoomModal');
    const modalImg = document.getElementById('zoomedImage');
    
    if (!modal || !modalImg) return;

    // Menangkap aksi klik di seluruh dokumen pada element ber-class .media-image
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('media-image')) {
            modalImg.src = e.target.src;
            modal.classList.remove('hidden');
            // Memicu animasi transisi halus Fade In dan Zoom In
            setTimeout(() => {
                modal.classList.add('opacity-100');
                modalImg.classList.remove('scale-95');
                modalImg.classList.add('scale-100');
            }, 20);
        }
    });

    // Menutup modal sewaktu area gelap di luar gambar diklik
    modal.addEventListener('click', function() {
        modal.classList.remove('opacity-100');
        modalImg.classList.remove('scale-100');
        modalImg.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    });
}

function renderCategoryFilters() {
    const container = document.getElementById('categoryFilters'); //[span_348](start_span)[span_348](end_span)
    if (!container || !apiData || !apiData.categories) return; //[span_349](start_span)[span_349](end_span)

    let html = `<button class="filter-btn active" data-filter="all" onclick="filterByCategory('all')">semua (${totalEndpoints})</button>`; //[span_350](start_span)[span_350](end_span)

    apiData.categories.forEach(category => {
        const catName = category.name.toLowerCase(); //[span_351](start_span)[span_351](end_span)
        const count = category.items.length; //[span_352](start_span)[span_352](end_span)
        html += `<button class="filter-btn" data-filter="${catName}" onclick="filterByCategory('${catName}')">${catName} (${count})</button>`; //[span_353](start_span)[span_353](end_span)
    });

    container.innerHTML = html; //[span_354](start_span)[span_354](end_span)
}

function filterByCategory(catName) {
    activeCategory = catName; //[span_355](start_span)[span_355](end_span)
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === catName) {
            btn.classList.add('active'); //[span_356](start_span)[span_356](end_span)
        } else {
            btn.classList.remove('active'); //[span_357](start_span)[span_357](end_span)
        }
    });
    performSearch(); //[span_358](start_span)[span_358](end_span)
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim(); //[span_359](start_span)[span_359](end_span)
    const noResults = document.getElementById('noResults'); //[span_360](start_span)[span_360](end_span)
    let hasVisibleItems = false; //[span_361](start_span)[span_361](end_span)

    requestAnimationFrame(() => {
        document.querySelectorAll('.category-group').forEach(category => {
            const catName = category.dataset.category; //[span_362](start_span)[span_362](end_span)
            
            if (activeCategory !== 'all' && catName !== activeCategory) {
                category.classList.add('hidden'); //[span_363](start_span)[span_363](end_span)
                return; //[span_364](start_span)[span_364](end_span)
            }

            let categoryHasVisibleItems = false; //[span_365](start_span)[span_365](end_span)
            const items = category.querySelectorAll('.api-item'); //[span_366](start_span)[span_366](end_span)
            
            for (let i = 0; i < items.length; i++) {
                const item = items[i]; //[span_367](start_span)[span_367](end_span)
                const matches = item.dataset.path.includes(searchTerm) || 
                                item.dataset.alias.includes(searchTerm) || 
                                item.dataset.description.includes(searchTerm) ||
                                item.dataset.category.includes(searchTerm); //[span_368](start_span)[span_368](end_span)
                if (matches) {
                    item.classList.remove('hidden'); //[span_369](start_span)[span_369](end_span)
                    categoryHasVisibleItems = true; //[span_370](start_span)[span_370](end_span)
                    hasVisibleItems = true; //[span_371](start_span)[span_371](end_span)
                } else {
                    item.classList.add('hidden'); //[span_372](start_span)[span_372](end_span)
                }
            }
            
            category.classList.toggle('hidden', !categoryHasVisibleItems); //[span_373](start_span)[span_373](end_span)
        });
        
        noResults.classList.toggle('hidden', hasVisibleItems); //[span_374](start_span)[span_374](end_span)
    });
}

function loadApis() {
    const apiList = document.getElementById('apiList'); //[span_375](start_span)[span_375](end_span)
    if (!apiData || !apiData.categories) { //[span_376](start_span)[span_376](end_span)
        apiList.innerHTML = '<p class="text-center">No API data loaded.</p>'; //[span_377](start_span)[span_377](end_span)
        return; //[span_378](start_span)[span_378](end_span)
    }
    
    totalEndpoints = 0; //[span_379](start_span)[span_379](end_span)
    totalCategories = apiData.categories.length; //[span_380](start_span)[span_380](end_span)
    apiData.categories.forEach(category => { totalEndpoints += category.items.length; }); //[span_381](start_span)[span_381](end_span)
    
    updateTotalEndpoints(); //[span_382](start_span)[span_382](end_span)
    updateTotalCategories(); //[span_383](start_span)[span_383](end_span)
    renderCategoryFilters(); //[span_384](start_span)[span_384](end_span)
    
    const isLightMode = body.classList.contains('light-mode'); //[span_385](start_span)[span_385](end_span)
    const pathColorClass = isLightMode ? 'text-cyan-700' : 'text-cyan-200'; //[span_386](start_span)[span_386](end_span)
    const subTextColorClass = isLightMode ? 'text-slate-600' : 'opacity-70'; //[span_387](start_span)[span_387](end_span)

    let html = ''; //[span_388](start_span)[span_388](end_span)
    apiData.categories.forEach((category, catIdx) => {
        const catNameLower = category.name.toLowerCase(); //[span_389](start_span)[span_389](end_span)
        
        let iconSvg = categoryIcons.default; //[span_390](start_span)[span_390](end_span)
        for (const [key, svg] of Object.entries(categoryIcons)) {
            if (catNameLower.includes(key)) {
                iconSvg = svg; //[span_391](start_span)[span_391](end_span)
                break; //[span_392](start_span)[span_392](end_span)
            }
        }

        html += `
        <div class="category-group" data-category="${catNameLower}">
            <div class="glass-panel border rounded-xl overflow-hidden shadow-lg mb-4">
                <button onclick="toggleCategory(${catIdx})" class="w-full px-4 py-4 flex items-center justify-between hover:bg-white/5 light-mode:hover:bg-black/5 transition-colors">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 flex items-center justify-center bg-slate-950/40 light-mode:bg-slate-200/50 rounded-xl border border-white/10 light-mode:border-slate-300 shadow-inner flex-shrink-0">
                            ${iconSvg}
                        </div>
                        <div class="text-left">
                            <h3 class="font-bold text-sm tracking-widest text-cyan-400 light-mode:text-cyan-600 uppercase font-['Space_Grotesk']">${category.name}</h3>
                            <p class="text-[11px] code-font ${subTextColorClass}">${category.items.length} ${i18n[currentLang].endpointsCount}</p>
                        </div>
                    </div>
                    <svg id="cat-icon-${catIdx}" class="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
                <div id="cat-${catIdx}" class="hidden">`; //[span_393](start_span)[span_393](end_span)
        
        category.items.forEach((item, epIdx) => {
            const method = item.methods && item.methods.length ? item.methods[0] : 'GET'; //[span_394](start_span)[span_394](end_span)
            const pathParts = item.path.split('?'); //[span_395](start_span)[span_395](end_span)
            const path = pathParts[0]; //[span_396](start_span)[span_396](end_span)
            const queryParams = new URLSearchParams(pathParts[1] || ''); //[span_397](start_span)[span_397](end_span)
            
            // Mengolah CSS Badge dinamis berdasarkan status ready, error, perbaikan, premium
            let statusClass = 'status-ready';
            if (item.status === 'error') statusClass = 'status-error';
            else if (item.status === 'perbaikan') statusClass = 'status-perbaikan';
            else if (item.status === 'premium') statusClass = 'status-premium';

            html += `
            <div class="api-item border-t border-white/10 light-mode:border-slate-200" 
                data-method="${method}" data-path="${path}" data-alias="${item.name.toLowerCase()}" data-description="${item.desc.toLowerCase()}" data-category="${category.name.toLowerCase()}">
                <button onclick="toggleEndpoint(${catIdx}, ${epIdx})" class="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 light-mode:hover:bg-black/5 transition-colors">
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                        <span class="bg-cyan-500 light-mode:bg-cyan-600 text-slate-950 light-mode:text-white px-2 py-0.5 rounded text-[10px] flex-shrink-0 code-font font-black">${method}</span>
                        <div class="text-left flex-1 min-w-0">
                            <p class="code-font font-semibold text-[13px] ${pathColorClass} truncate">${path}</p>
                            <div class="flex items-center gap-2 mt-1">
                                <p class="text-xs ${subTextColorClass} truncate">${item.name}</p>
                                <span class="px-1.5 py-0.5 text-[9px] rounded-sm ${statusClass} flex-shrink-0 uppercase tracking-wider font-bold">${item.status || 'ready'}</span>
                            </div>
                        </div>
                    </div>
                </button>
                <div id="ep-${catIdx}-${epIdx}" class="hidden bg-slate-950/40 light-mode:bg-slate-50/50 px-4 py-4 border-t border-white/10 light-mode:border-slate-200 backdrop-blur-sm">
                    <p class="text-xs mb-4 ${isLightMode ? 'text-slate-700' : 'opacity-80'}">${item.desc}</p>
                    
                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-bold text-[11px] uppercase tracking-wider text-slate-400 light-mode:text-slate-600 code-font">ENDPOINT / REQUEST URL</h4>
                            <button type="button" onclick="copyFromElement('live-url-${catIdx}-${epIdx}', 'URL')" class="px-3 py-1 bg-white/5 hover:bg-white/10 light-mode:bg-slate-200 light-mode:hover:bg-slate-300 border border-white/10 light-mode:border-slate-300 rounded-lg text-[10px] transition-all active:scale-95 code-font text-slate-300 light-mode:text-slate-800">Copy URL</button>
                        </div>
                        <div class="bg-slate-900/40 light-mode:bg-slate-200/60 border border-white/10 light-mode:border-slate-300 px-4 py-3 rounded-xl backdrop-blur-md shadow-inner">
                            <code id="live-url-${catIdx}-${epIdx}" class="code-font text-xs text-cyan-400 light-mode:text-cyan-700 font-medium break-all">${BASE_URL}${path}</code>
                        </div>
                    </div>

                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-bold text-[11px] uppercase tracking-wider text-slate-400 light-mode:text-slate-600 code-font">cURL Command</h4>
                            <button type="button" onclick="copyFromElement('live-curl-${catIdx}-${epIdx}', 'cURL')" class="px-3 py-1 bg-white/5 hover:bg-white/10 light-mode:bg-slate-200 light-mode:hover:bg-slate-300 border border-white/10 light-mode:border-slate-300 rounded-lg text-[10px] transition-all active:scale-95 code-font text-slate-300 light-mode:text-slate-800">Copy cURL</button>
                        </div>
                        <div class="bg-slate-900/40 light-mode:bg-slate-200/60 border border-white/10 light-mode:border-slate-300 px-4 py-3 rounded-xl backdrop-blur-md shadow-inner">
                            <code id="live-curl-${catIdx}-${epIdx}" class="code-font text-xs text-slate-300 light-mode:text-slate-700 block overflow-x-auto whitespace-pre">curl -X ${method} "${BASE_URL}${path}"</code>
                        </div>
                    </div>`; //[span_398](start_span)[span_398](end_span)

            // Form eksekusi hanya terbuka penuh jika statusnya ready ataupun premium custom
            if (item.status === 'ready' || item.status === 'premium') {
                html += `
                    <div>
                        <h4 class="font-bold text-[11px] uppercase tracking-wider text-slate-400 light-mode:text-slate-600 mb-3">Parameter</h4>
                        <form id="form-${catIdx}-${epIdx}" onsubmit="executeRequest(event, ${catIdx}, ${epIdx}, '${method}', '${path}', '${item.status}')">
                            <div class="space-y-3 mb-4">`; //[span_399](start_span)[span_399](end_span)
                if (item.params) {
                    Object.keys(item.params).forEach(paramName => {
                        const isRequired = !queryParams.has(paramName) || queryParams.get(paramName) === ''; //[span_400](start_span)[span_400](end_span)
                        html += `
                            <div>
                                <label class="block text-xs font-semibold text-slate-300 light-mode:text-slate-700 mb-1.5 code-font">
                                    ${paramName} ${isRequired ? '<span class="text-red-500">*</span>' : ''}
                                </label>
                                <input type="text" name="${paramName}" oninput="updateLivePreview(${catIdx}, ${epIdx}, '${method}', '${path}')" class="w-full px-3 py-2 rounded-lg bg-black/40 light-mode:bg-white border border-white/10 light-mode:border-slate-300 text-white light-mode:text-slate-900 focus:outline-none focus:border-cyan-500 code-font text-sm" placeholder="${item.params[paramName]}" ${isRequired ? 'required' : ''}>
                            </div>`; //[span_401](start_span)[span_401](end_span)
                    });
                }
                html += `
                            </div>
                            <div class="flex gap-3">
                                <button type="submit" class="px-5 py-2 bg-cyan-500 light-mode:bg-cyan-600 hover:bg-cyan-400 light-mode:hover:bg-cyan-500 text-slate-950 light-mode:text-white rounded-md font-bold text-xs tracking-wider transition-all flex items-center justify-center">EKSEKUSI</button>
                                <button type="button" onclick="clearResponse(${catIdx}, ${epIdx})" class="px-5 py-2 bg-transparent border border-white/20 light-mode:border-slate-300 hover:border-white/40 light-mode:hover:bg-slate-100 text-slate-300 light-mode:text-slate-700 rounded-md font-bold text-xs transition-colors">BERSIHKAN</button>
                            </div>
                        </form>

                        <div id="response-${catIdx}-${epIdx}" class="hidden mt-6 space-y-4">
                            <div>
                                <h5 class="text-[11px] uppercase tracking-wider font-bold mb-2 text-slate-400 light-mode:text-slate-500">Response</h5>
                                <div class="bg-slate-950/80 light-mode:bg-slate-100 border border-white/10 light-mode:border-slate-300 p-3 rounded-lg min-h-[100px] overflow-x-auto" id="response-content-${catIdx}-${epIdx}"></div>
                            </div>
                        </div>
                    </div>`; //[span_402](start_span)[span_402](end_span)
            } else {
                // Memberi peringatan pemblokiran tombol untuk status error maupun perbaikan
                html += `<div class="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-500 font-medium">${i18n[currentLang].endpointNotAvailable}</div>`;
            }
            html += `</div></div>`; //[span_403](start_span)[span_403](end_span)
        });
        html += `</div></div></div>`; //[span_404](start_span)[span_404](end_span)
    });
    apiList.innerHTML = html; //[span_405](start_span)[span_405](end_span)
    allApiElements = Array.from(document.querySelectorAll('.api-item')); //[span_406](start_span)[span_406](end_span)
}

function initMultiMusicPlayer() {
    const playlist = window.musicPlaylist || []; //[span_407](start_span)[span_407](end_span)
    if (!playlist.length) return; //[span_408](start_span)[span_408](end_span)

    let currentTrackIdx = 0; //[span_409](start_span)[span_409](end_span)
    const audio = document.getElementById('audioElement'); //[span_410](start_span)[span_410](end_span)
    const playBtn = document.getElementById('playBtn'); //[span_411](start_span)[span_411](end_span)
    const playIcon = document.getElementById('playIcon'); //[span_412](start_span)[span_412](end_span)
    const progressBar = document.getElementById('progressBar'); //[span_413](start_span)[span_413](end_span)
    const progressContainer = document.getElementById('progressContainer'); //[span_414](start_span)[span_414](end_span)
    const currentTimeEl = document.getElementById('currentTime'); //[span_415](start_span)[span_415](end_span)
    const totalDurationEl = document.getElementById('totalDuration'); //[span_416](start_span)[span_416](end_span)
    const coverImg = document.getElementById('musicCoverImg'); //[span_417](start_span)[span_417](end_span)
    const titleEl = document.getElementById('musicTitle'); //[span_418](start_span)[span_418](end_span)
    const artistEl = document.getElementById('musicArtist'); //[span_419](start_span)[span_419](end_span)
    const playlistPanel = document.getElementById('playlistPanel'); //[span_420](start_span)[span_420](end_span)

    function formatTime(secs) {
        if (isNaN(secs)) return "0:00"; //[span_421](start_span)[span_421](end_span)
        const mins = Math.floor(secs / 60); //[span_422](start_span)[span_422](end_span)
        const remainingSecs = Math.floor(secs % 60); //[span_423](start_span)[span_423](end_span)
        return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`; //[span_424](start_span)[span_424](end_span)
    }

    function loadTrack(index) {
        currentTrackIdx = index; //[span_425](start_span)[span_425](end_span)
        const track = playlist[index]; //[span_426](start_span)[span_426](end_span)
        audio.src = track.url; //[span_427](start_span)[span_427](end_span)
        titleEl.textContent = track.title; //[span_428](start_span)[span_428](end_span)
        artistEl.textContent = track.artist; //[span_429](start_span)[span_429](end_span)
        coverImg.src = track.cover; //[span_430](start_span)[span_430](end_span)
        progressBar.style.width = '0%'; //[span_431](start_span)[span_431](end_span)
        currentTimeEl.textContent = '0:00'; //[span_432](start_span)[span_432](end_span)
        renderPlaylistItems(); //[span_433](start_span)[span_433](end_span)
    }

    function renderPlaylistItems() {
        playlistPanel.innerHTML = ''; //[span_434](start_span)[span_434](end_span)
        playlist.forEach((track, idx) => {
            const isActive = idx === currentTrackIdx; //[span_435](start_span)[span_435](end_span)
            const itemBtn = document.createElement('button'); //[span_436](start_span)[span_436](end_span)
            itemBtn.className = `w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition-all ${isActive ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 light-mode:text-cyan-700 font-bold' : 'hover:bg-white/5 light-mode:hover:bg-black/5 text-slate-400 light-mode:text-slate-600'}`; //[span_437](start_span)[span_437](end_span)
            itemBtn.innerHTML = `<div class="flex items-center gap-2 truncate"><span class="opacity-50 text-[10px] code-font">${String(idx + 1).padStart(2, '0')}</span><span class="truncate">${track.title} <span class="opacity-60 font-normal">- ${track.artist}</span></span></div>${isActive ? '<span class="text-[9px] tracking-wider text-cyan-500 bg-cyan-500/10 px-1.5 py-0.5 rounded animate-pulse font-bold">PLAYING</span>' : ''}`; //[span_438](start_span)[span_438](end_span)
            itemBtn.addEventListener('click', () => {
                loadTrack(idx); //[span_439](start_span)[span_439](end_span)
                audio.play().catch(e => console.log(e)); //[span_440](start_span)[span_440](end_span)
            });
            playlistPanel.appendChild(itemBtn); //[span_441](start_span)[span_441](end_span)
        });
    }

    playBtn.addEventListener('click', () => { audio.paused ? audio.play() : audio.pause(); }); //[span_442](start_span)[span_442](end_span)
    audio.addEventListener('play', () => {
        playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'; //[span_443](start_span)[span_443](end_span)
        coverImg.classList.add('scale-105', 'rotate-3'); //[span_444](start_span)[span_444](end_span)
    });
    audio.addEventListener('pause', () => {
        playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>'; //[span_445](start_span)[span_445](end_span)
        coverImg.classList.remove('scale-105', 'rotate-3'); //[span_446](start_span)[span_446](end_span)
    });
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) { //[span_447](start_span)[span_447](end_span)
            progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`; //[span_448](start_span)[span_448](end_span)
            currentTimeEl.textContent = formatTime(audio.currentTime); //[span_449](start_span)[span_449](end_span)
        }
    });
    audio.addEventListener('loadedmetadata', () => { totalDurationEl.textContent = formatTime(audio.duration); }); //[span_450](start_span)[span_450](end_span)
    progressContainer.addEventListener('click', (e) => { if (audio.duration) audio.currentTime = (e.offsetX / progressContainer.clientWidth) * audio.duration; }); //[span_451](start_span)[span_451](end_span)
    document.getElementById('prevBtn').addEventListener('click', () => { loadTrack(currentTrackIdx - 1 < 0 ? playlist.length - 1 : currentTrackIdx - 1); audio.play(); }); //[span_452](start_span)[span_452](end_span)
    document.getElementById('nextBtn').addEventListener('click', () => { loadTrack(currentTrackIdx + 1 >= playlist.length ? 0 : currentTrackIdx + 1); audio.play(); }); //[span_453](start_span)[span_453](end_span)
    audio.addEventListener('ended', () => { loadTrack(currentTrackIdx + 1 >= playlist.length ? 0 : currentTrackIdx + 1); audio.play(); }); //[span_454](start_span)[span_454](end_span)
    document.getElementById('playlistToggleBtn').addEventListener('click', () => { playlistPanel.classList.toggle('hidden'); }); //[span_455](start_span)[span_455](end_span)

    loadTrack(0); //[span_456](start_span)[span_456](end_span)
}

document.addEventListener('DOMContentLoaded', function() {
    const savedLang = localStorage.getItem('lang') || 'id'; //[span_457](start_span)[span_457](end_span)
    
    initTheme(); //[span_458](start_span)[span_458](end_span)
    initBatteryDetection(); //[span_459](start_span)[span_459](end_span)
    initDigitalClock(); // Mengaktifkan jam digital multi-bahasa[span_460](start_span)[span_460](end_span)
    initMultiMusicPlayer(); //[span_461](start_span)[span_461](end_span)
    initImageZoomHandler(); // Mengaktifkan pembesar gambar respons saat diklik
    setLanguage(savedLang); //[span_462](start_span)[span_462](end_span)
    
    const bioMenuBtn = document.getElementById('bioMenuBtn'); //[span_463](start_span)[span_463](end_span)
    const bioDropdown = document.getElementById('bioDropdown'); //[span_464](start_span)[span_464](end_span)
    const closeMenuBtn = document.getElementById('closeMenuBtn'); //[span_465](start_span)[span_465](end_span)
    const menuOverlay = document.getElementById('menuOverlay'); //[span_466](start_span)[span_466](end_span)

    if (bioMenuBtn && bioDropdown && menuOverlay) { //[span_467](start_span)[span_467](end_span)
        bioMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); //[span_468](start_span)[span_468](end_span)
            bioDropdown.style.transform = 'translateX(0)'; //[span_469](start_span)[span_469](end_span)
            menuOverlay.classList.remove('hidden'); //[span_470](start_span)[span_470](end_span)
        });
        if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeSidebarMenu); //[span_471](start_span)[span_471](end_span)
        menuOverlay.addEventListener('click', closeSidebarMenu); //[span_472](start_span)[span_472](end_span)
        bioDropdown.addEventListener('click', (e) => { e.stopPropagation(); }); //[span_473](start_span)[span_473](end_span)
    }
    
    fetch('/api/apilist') //[span_474](start_span)[span_474](end_span)
        .then(res => res.json()) //[span_475](start_span)[span_475](end_span)
        .then(data => {
            apiData = data; //[span_476](start_span)[span_476](end_span)
            loadApis(); //[span_477](start_span)[span_477](end_span)
        })
        .catch(err => {
            document.getElementById('apiList').innerHTML = `<div class="text-center p-8 bg-red-900/20 border border-red-700 rounded-lg"><div class="text-4xl mb-4">⚠️</div><h3 class="font-bold text-lg mb-2">Failed to load API data</h3></div>`; //[span_478](start_span)[span_478](end_span)
        });
});

themeToggleBtn.addEventListener('click', toggleTheme); //[span_479](start_span)[span_479](end_span)

let searchTimeout; //[span_480](start_span)[span_480](end_span)
document.getElementById('searchInput').addEventListener('input', function() {
    clearTimeout(searchTimeout); //[span_481](start_span)[span_481](end_span)
    searchTimeout = setTimeout(performSearch, 150); //[span_482](start_span)[span_482](end_span)
});

window.addEventListener('beforeunload', cleanupBatteryMonitor); //[span_483](start_span)[span_483](end_span)
