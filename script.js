/* =========================================================================
   SCRIPT.JS REST API (UPDATED)
   ========================================================================= */

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
            };

            boundUpdateBatteryInfo();
            battery.addEventListener('levelchange', boundUpdateBatteryInfo);
            battery.addEventListener('chargingchange', boundUpdateBatteryInfo);
            battery.addEventListener('chargingtimechange', boundUpdateBatteryInfo);
            battery.addEventListener('dischargingtimechange', boundUpdateBatteryInfo);
            window.addEventListener('batteryupdate-hook', boundUpdateBatteryInfo);
            batteryMonitor = battery;

        }).catch(function(error) {
            fallbackBattery();
        });
    } else {
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
                newLevel = Math.min(100, newLevel + 0.5);
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
                newLevel = Math.max(5, newLevel - 0.1);
                if (newLevel <= 15 && Math.random() > 0.7) {
                    isSimulatedCharging = true;
                    localStorage.setItem('simulatedCharging', 'true');
                    batteryContainer.classList.add('charging');
                    batteryLevelElement.classList.remove('battery-charging');
                    batteryStatusElement.textContent = i18n[currentLang].batteryCharging;
                } else {
                    batteryStatusElement.textContent = `2h 30m ${i18n[currentLang].batteryLeft}`;
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
        if (!batteryInterval) batteryInterval = setInterval(simulateBattery, 10000);
    }
}

function cleanupBatteryMonitor() {
    if (batteryMonitor && boundUpdateBatteryInfo) {
        batteryMonitor.removeEventListener('levelchange', boundUpdateBatteryInfo);
        batteryMonitor.removeEventListener('chargingchange', boundUpdateBatteryInfo);
        batteryMonitor.removeEventListener('chargingtimechange', boundUpdateBatteryInfo);
        batteryMonitor.removeEventListener('dischargingtimechange', boundUpdateBatteryInfo);
        window.removeEventListener('batteryupdate-hook', boundUpdateBatteryInfo);
    }
    if (batteryInterval) clearInterval(batteryInterval);
}

function initDigitalClock() {
    const clockElement = document.getElementById('liveClock');
    const dateElement = document.getElementById('liveDate');
    if (!clockElement || !dateElement) return;

    function updateClock() {
        if (typeof moment !== 'undefined') {
            const now = moment().tz("Asia/Jakarta");
            clockElement.textContent = now.format('HH:mm:ss');
            if (currentLang === 'id') dateElement.textContent = now.locale('id').format('dddd, D MMMM YYYY');
            else dateElement.textContent = now.locale('en').format('dddd, MMMM D, YYYY');
        }
    }
    updateClock();
    setInterval(updateClock, 1000);
}

function updateTotalEndpoints() { document.getElementById('totalEndpoints').textContent = totalEndpoints; }
function updateTotalCategories() { document.getElementById('totalCategories').textContent = totalCategories; }

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
    if (el) copyText(el.innerText || el.textContent, type);
}

function updateLivePreview(catIdx, epIdx, method, basePath, endpointType) {
    const form = document.getElementById(`form-${catIdx}-${epIdx}`);
    if (!form) return;

    const formData = new FormData(form);
    const params = new URLSearchParams();
    
    let userApikey = formData.get('apikey') || 'arulzxd-keys';

    for (const [key, value] of formData.entries()) {
        if (value && typeof value === 'string' && key !== 'apikey') {
             params.append(key, value);
        }
    }

    params.append('apikey', userApikey);
    const queryStr = params.toString();
    const finalUrl = `${BASE_URL}${basePath}?${queryStr}`;

    const urlContainer = document.getElementById(`live-url-${catIdx}-${epIdx}`);
    const curlContainer = document.getElementById(`live-curl-${catIdx}-${epIdx}`);

    if (urlContainer) urlContainer.textContent = finalUrl;
    if (curlContainer) {
        if (method === 'GET' || method === 'DELETE') {
            curlContainer.textContent = `curl -X ${method} "${finalUrl}"`;
        } else {
            const bodyParams = [];
            for (const [key, value] of formData.entries()) {
                if (key === 'apikey') continue;
                if (value && typeof value === 'string') {
                    bodyParams.push(`"${key}": "${value}"`);
                }
            }
            const dataString = bodyParams.length ? ` -H "Content-Type: application/json" -d '{${bodyParams.join(', ')}}'` : '';
            curlContainer.textContent = `curl -X ${method} "${finalUrl}"${dataString}`;
        }
    }
}

async function executeRequest(e, catIdx, epIdx, method, path, endpointType) {
    e.preventDefault();
    if (isRequestInProgress) {
        showToast(i18n[currentLang].toastRequestWait, true);
        return;
    }

    const form = document.getElementById(`form-${catIdx}-${epIdx}`);
    const responseDiv = document.getElementById(`response-${catIdx}-${epIdx}`);
    const responseContent = document.getElementById(`response-content-${catIdx}-${epIdx}`);
    const executeBtn = form.querySelector('button[type="submit"]');

    let spinner = executeBtn.querySelector('.local-spinner');
    if (!spinner) {
        spinner = document.createElement('span');
        spinner.className = 'local-spinner ml-2';
        executeBtn.appendChild(spinner);
    }

    isRequestInProgress = true;
    executeBtn.disabled = true;
    executeBtn.classList.add('btn-loading');
    
    // Sembunyikan spinner bawaan agar tidak bertumpuk
    spinner.style.setProperty('display', 'none', 'important');
    spinner.classList.remove('active');
    
    responseDiv.classList.remove('hidden');

    // Animasi Teks Loading di dalam kotak RESPONSE (Menggunakan 3 titik melompat)
    responseContent.innerHTML = `
        <div class="flex items-center justify-center p-8 text-sm font-mono tracking-wider text-cyan-400 gap-1.5">
            <span>FETCHING RESPONSE</span>
            <span class="flex gap-1 items-center pt-1">
                <span class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-[bounce_1s_infinite_100ms]"></span>
                <span class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-[bounce_1s_infinite_200ms]"></span>
                <span class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-[bounce_1s_infinite_300ms]"></span>
            </span>
        </div>
    `;

    // Simpan inner HTML asli tombol eksekusi
    const originalBtnHtml = executeBtn.innerHTML;

    // Animasi Teks Loading pada TOMBOL EKSEKUSI (Menggunakan 3 titik melompat)
    executeBtn.innerHTML = `
        <div class="flex items-center justify-center gap-1">
            <span class="tracking-wide">LOADING</span>
            <span class="flex gap-0.5 ml-0.5">
                <span class="w-1 h-1 bg-current rounded-full animate-[bounce_1s_infinite_100ms]"></span>
                <span class="w-1 h-1 bg-current rounded-full animate-[bounce_1s_infinite_200ms]"></span>
                <span class="w-1 h-1 bg-current rounded-full animate-[bounce_1s_infinite_300ms]"></span>
            </span>
        </div>
    `;

    const rawFormData = new FormData(form);
    const queryParams = new URLSearchParams();

    let formHasFile = false;
    form.querySelectorAll('input[type="file"]').forEach(fileInput => {
        if (fileInput.files.length > 0) {
            formHasFile = true;
        }
    });

    let finalMethod = method.toUpperCase();
    if (formHasFile) {
        finalMethod = 'POST';
    }

    let fetchOptions = { method: finalMethod };
    let fullPath = `${BASE_URL}${path.split('?')[0]}`;
    let isMedia = false;

    try {
        if (finalMethod === 'GET' || finalMethod === 'DELETE') {
            for (const [key, value] of rawFormData.entries()) {
                if (value && typeof value === 'string') {
                    queryParams.append(key, value);
                }
            }
            fullPath += '?' + queryParams.toString();
        } else {
            if (formHasFile) {
                fetchOptions.body = rawFormData;
            } else {
                fetchOptions.headers = { 'Content-Type': 'application/json' };
                const jsonBody = {};
                for (const [key, value] of rawFormData.entries()) {
                    if (value) jsonBody[key] = value;
                }
                fetchOptions.body = JSON.stringify(jsonBody);
            }
        }

        const startTime = performance.now();
        const response = await fetch(fullPath, fetchOptions);
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        if (response.status === 403 || response.status === 503) {
            const data = await response.json();
            responseContent.innerHTML = `<pre class="text-red-400 code-font text-sm overflow-auto p-2 bg-black/50 rounded-lg">${JSON.stringify(data, null, 2)}</pre>`;
            showToast(data.message || "Akses Ditolak!", true);
            return;
        }

        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

        const contentType = response.headers.get("content-type") || "application/octet-stream";
        const cleanContentType = contentType.split(';')[0].trim();
        const contentLength = response.headers.get("content-length");

        let sizeText = "0 B";
        let bytes = contentLength ? parseInt(contentLength, 10) : 0;
        let rawResponseText = "";
        let finalInnerContent = "";

        if (cleanContentType.includes("application/json")) {
            const data = await response.json();
            rawResponseText = JSON.stringify(data, null, 2);

            if (!bytes) bytes = new Blob([rawResponseText]).size;

            let detectedMediaUrl = null;
            if (data.url && typeof data.url === 'string' && data.url.startsWith('http')) detectedMediaUrl = data.url;
            else if (data.result && data.result.url && typeof data.result.url === 'string') detectedMediaUrl = data.result.url;

            if (detectedMediaUrl && (detectedMediaUrl.match(/\.(jpeg|jpg|gif|png|webp|mp4|mp3|webm|mov|wav|ogg|pdf|docx|xlsx|zip|txt|js)/i))) {
                 finalInnerContent = createMediaPreview(detectedMediaUrl, null, detectedMediaUrl) + `<div class="mt-4 text-xs font-bold text-slate-500 uppercase">RAW JSON DATA</div><pre id="raw-text-${catIdx}-${epIdx}" class="code-font text-sm overflow-auto text-cyan-400 p-2 bg-black/50 rounded-lg mt-2">${rawResponseText}</pre>`;
                 isMedia = true;
            } else {
                 finalInnerContent = `<pre id="raw-text-${catIdx}-${epIdx}" class="code-font text-sm overflow-auto text-cyan-400 p-2">${rawResponseText}</pre>`;
            }
        } else if (cleanContentType.startsWith("image/") || cleanContentType.startsWith("video/") || cleanContentType.startsWith("audio/") || cleanContentType.includes("application/pdf")) {
            isMedia = true;
            const blob = await response.blob();
            if (!bytes) bytes = blob.size;
            const blobUrl = URL.createObjectURL(blob);
            finalInnerContent = createMediaPreview(blobUrl, cleanContentType, fullPath);
        } else {
            rawResponseText = await response.text();
            if (!bytes) bytes = new Blob([rawResponseText]).size;
            finalInnerContent = `<pre id="raw-text-${catIdx}-${epIdx}" class="code-font text-sm overflow-auto p-2">${rawResponseText}</pre>`;
        }

        if (bytes >= 1048576) sizeText = `${(bytes / 1048576).toFixed(1)} MB`;
        else if (bytes >= 1024) sizeText = `${(bytes / 1024).toFixed(1)} KB`;
        else sizeText = `${bytes} B`;

        const metadataBadgeHtml = `
            <div class="flex flex-wrap items-center gap-2 px-4 py-2 mb-4 text-xs font-mono font-bold rounded-lg bg-emerald-400 text-slate-900 border border-emerald-500/30 shadow-sm w-fit">
                <span>HTTP ${response.status}</span>
                <span class="opacity-40">•</span>
                <span>${duration}ms</span>
                <span class="opacity-40">•</span>
                <span>${cleanContentType}</span>
                <span class="opacity-40">•</span>
                <span>${sizeText}</span>
            </div>
        `;

        responseContent.innerHTML = metadataBadgeHtml + finalInnerContent;

        const isLightMode = body.classList.contains('light-mode');
        const btnStyle = isLightMode 
            ? 'px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-[11px] font-semibold transition-colors code-font border border-black/5 flex items-center gap-1.5 shadow-sm'
            : 'px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-semibold transition-colors code-font border border-white/5 flex items-center gap-1.5';

        const actionContainer = document.createElement('div');
        actionContainer.className = "flex flex-wrap gap-2 mb-3 border-b border-white/10 light-mode:border-slate-200 pb-3 mt-3";

        if (!isMedia) {
            // 1. Tombol Copy Response JSON (Menggunakan SVG Icon)
            const copyResponseBtn = document.createElement('button');
            copyResponseBtn.type = "button";
            copyResponseBtn.className = btnStyle;
            copyResponseBtn.innerHTML = `
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                <span>Copy Response JSON</span>
            `;
            copyResponseBtn.onclick = () => copyText(rawResponseText, "Response");
            actionContainer.appendChild(copyResponseBtn);

            // 2. Tombol Download Response (Untuk mendownload teks/JSON apa saja)
            const downloadResponseBtn = document.createElement('button');
            downloadResponseBtn.type = "button";
            downloadResponseBtn.className = btnStyle;
            downloadResponseBtn.innerHTML = `
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                <span>Download Response</span>
            `;
            downloadResponseBtn.onclick = () => {
                const blob = new Blob([rawResponseText], { type: cleanContentType });
                const extension = cleanContentType.includes('json') ? 'json' : 'txt';
                const downloadUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `response-${Date.now()}.${extension}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(downloadUrl);
            };
            actionContainer.appendChild(downloadResponseBtn);
        } else {
            // 3. Tombol Download Media (Mengunduh file biner media gambar/video/audio dll)
            const downloadMediaBtn = document.createElement('button');
            downloadMediaBtn.type = "button";
            downloadMediaBtn.className = btnStyle;
            downloadMediaBtn.innerHTML = `
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                <span>Download Media</span>
            `;
            downloadMediaBtn.onclick = async () => {
                try {
                    const mediaRes = await fetch(fullPath);
                    const mediaBlob = await mediaRes.blob();
                    const downloadUrl = URL.createObjectURL(mediaBlob);
                    const a = document.createElement('a');
                    a.href = downloadUrl;
                    
                    const ext = cleanContentType.split('/')[1] || 'bin';
                    a.download = `media-${Date.now()}.${ext}`;
                    
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(downloadUrl);
                } catch (err) {
                    showToast('Gagal mengunduh file media', true);
                }
            };
            actionContainer.appendChild(downloadMediaBtn);
        }

        const badgeElement = responseContent.querySelector('.bg-emerald-400');
        if (badgeElement) {
            badgeElement.insertAdjacentElement('afterend', actionContainer);
        } else {
            responseContent.insertBefore(actionContainer, responseContent.firstChild);
        }

        showToast(i18n[currentLang].toastRequestSuccess);
    } catch (error) {
        responseContent.innerHTML = `<pre class="text-red-400 code-font text-sm p-2 bg-red-500/10 rounded-lg">Error: ${error.message}</pre>`;
        showToast(i18n[currentLang].toastRequestFailed, true);
    } finally {
        isRequestInProgress = false;
        executeBtn.disabled = false;
        executeBtn.classList.remove('btn-loading');
        
        spinner.style.display = ''; 
        spinner.classList.remove('active');
        
        executeBtn.innerHTML = originalBtnHtml;
    }
}

function clearResponse(catIdx, epIdx, endpointType) {
    const responseDiv = document.getElementById(`response-${catIdx}-${epIdx}`);
    if (responseDiv) responseDiv.classList.add('hidden');

    const icon = document.getElementById(`ep-icon-${catIdx}-${epIdx}`);
    if (icon) icon.textContent = '+';

    const form = document.getElementById(`form-${catIdx}-${epIdx}`);
    if (form) {
        form.reset(); 
        const urlContainer = document.getElementById(`live-url-${catIdx}-${epIdx}`);
        if (urlContainer) {
            const basePath = urlContainer.textContent.split('?')[0];
            urlContainer.textContent = basePath;
        }

        const curlContainer = document.getElementById(`live-curl-${catIdx}-${epIdx}`);
        if (curlContainer) {
            const method = curlContainer.textContent.split(' ')[1] || 'GET';
            const baseUrl = curlContainer.textContent.split('"')[1] || '';
            curlContainer.textContent = `curl -X ${method} "${baseUrl.split('?')[0]}"`;
        }
    }
}

function renderCategoryFilters() {
    const container = document.getElementById('categoryFilters');
    if (!container || !apiData || !apiData.categories) return;

    let html = `<button class="filter-btn active" data-filter="all" onclick="filterByCategory('all')">semua (${totalEndpoints})</button>`;
    apiData.categories.forEach(category => {
        const catName = category.name.toLowerCase();
        html += `<button class="filter-btn" data-filter="${catName}" onclick="filterByCategory('${catName}')">${catName} (${category.items.length})</button>`;
    });
    container.innerHTML = html;
}

function filterByCategory(catName) {
    activeCategory = catName;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === catName) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    performSearch();
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const noResults = document.getElementById('noResults');
    let hasVisibleItems = false;

    requestAnimationFrame(() => {
        document.querySelectorAll('.category-group').forEach(category => {
            const catName = category.dataset.category;
            if (activeCategory !== 'all' && catName !== activeCategory) {
                category.classList.add('hidden');
                return;
            }

            let categoryHasVisibleItems = false;
            const items = category.querySelectorAll('.api-item');

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const matches = item.dataset.path.includes(searchTerm) || 
                                item.dataset.alias.includes(searchTerm) || 
                                item.dataset.description.includes(searchTerm) ||
                                item.dataset.category.includes(searchTerm);
                if (matches) {
                    item.classList.remove('hidden');
                    categoryHasVisibleItems = true;
                    hasVisibleItems = true;
                } else {
                    item.classList.add('hidden');
                }
            }
            category.classList.toggle('hidden', !categoryHasVisibleItems);
        });
        noResults.classList.toggle('hidden', hasVisibleItems);
    });
}

function loadApis() {
    const apiList = document.getElementById('apiList');
    if (!apiData || !apiData.categories) {
        apiList.innerHTML = '<p class="text-center">No API data loaded.</p>';
        return;
    }

    totalEndpoints = 0;
    totalCategories = apiData.categories.length;
    apiData.categories.forEach(category => { totalEndpoints += category.items.length; });

    updateTotalEndpoints();
    updateTotalCategories();
    renderCategoryFilters();

    const isLightMode = body.classList.contains('light-mode');
    const pathColorClass = isLightMode ? 'text-cyan-700' : 'text-cyan-200';
    const subTextColorClass = isLightMode ? 'text-slate-600' : 'opacity-70';

    let html = '';
    apiData.categories.forEach((category, catIdx) => {
        const catNameLower = category.name.toLowerCase();
        let iconSvg = categoryIcons.default;
        for (const [key, svg] of Object.entries(categoryIcons)) {
            if (catNameLower.includes(key)) { iconSvg = svg; break; }
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
                <div id="cat-${catIdx}" class="hidden">`;

        category.items.forEach((item, epIdx) => {
            const method = item.methods && item.methods.length ? item.methods[0] : 'GET';
            const pathParts = item.path.split('?');
            const path = pathParts[0];
            const epType = item.type || 'free';

            let statusClass = "status-ready";
            let statusText = "READY"; 
            if (item.status === 'update') { statusClass = 'status-update'; statusText = "UPDATE"; }
            else if (item.status === 'error' || item.status === 'perbaikan') { statusClass = 'status-error'; statusText = "MAINTENANCE"; }

            let badgeTypeHtml = epType === 'premium' 
                ? `<span class="px-1.5 py-0.5 text-[9px] rounded-sm bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-wider animate-pulse">👑 PREMIUM</span>`
                : `<span class="px-1.5 py-0.5 text-[9px] rounded-sm bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold uppercase tracking-wider">FREE</span>`;

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
                                <span class="px-1.5 py-0.5 text-[9px] rounded-sm ${statusClass} flex-shrink-0 uppercase tracking-wider font-bold">${statusText}</span>
                                ${badgeTypeHtml}
                            </div>
                        </div>
                    </div>
                    <span id="ep-icon-${catIdx}-${epIdx}" class="text-base font-bold text-cyan-400 light-mode:text-cyan-600 px-2 code-font">+</span>
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
                    </div>`;

            if (item.status === 'ready' || item.status === 'update') {
                html += `
                    <div>
                        <h4 class="font-bold text-[11px] uppercase tracking-wider text-slate-400 light-mode:text-slate-600 mb-3">Parameter</h4>
                        <form id="form-${catIdx}-${epIdx}" onsubmit="executeRequest(event, ${catIdx}, ${epIdx}, '${method}', '${path}', '${epType}')">
                            <div class="space-y-4 mb-4">`;

                // Cari potongan kode ini di dalam fungsi `loadApis()` pada script.js Anda:
if (item.params) {
    Object.keys(item.params).forEach(paramName => {
        const pType = item.params[paramName];
        const isRequired = true; 
        let paramDesc = (pType && pType.type) ? pType.type : (pType || paramName);

        let inputValue = '';
        let inputPlaceholder = `Masukkan ${paramName}`;

        if (paramName.toLowerCase() === 'apikey') {
            if (epType === 'premium') {
                inputValue = '';
                inputPlaceholder = 'Masukkan apikey premium';
            } else {
                inputValue = 'arulzxd-keys';
                inputPlaceholder = 'Masukkan apikey';
            }
        }

        html += `
        <div>
            <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-semibold text-slate-300 light-mode:text-slate-700 code-font">
                    ${paramName} ${isRequired ? '<span class="text-red-500">*</span>' : ''}
                </label>
                <span class="text-[10px] text-slate-500 light-mode:text-slate-400 italic font-normal">${paramDesc}</span>
            </div>`;

        // MODIFIKASI SELEKSI INPUT / SELECT DROPDOWN
        if (pType === 'file' || paramName === 'file') {
            html += `<input type="file" name="${paramName}" onchange="updateLivePreview(${catIdx}, ${epIdx}, '${method}', '${path}', '${epType}')" class="w-full px-3 py-2 rounded-lg bg-black/40 light-mode:bg-white border border-white/10 light-mode:border-slate-300 text-white light-mode:text-slate-900 focus:outline-none focus:border-cyan-500 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20" ${isRequired ? 'required' : ''}>`;
        } 
        else if (pType && pType.type === 'select' && Array.isArray(pType.options)) {
            // JIKA PARAMETER ADALAH SELECT, BUAT ELEMEN DROPDOWN MENU
            html += `<select name="${paramName}" onchange="updateLivePreview(${catIdx}, ${epIdx}, '${method}', '${path}', '${epType}')" class="w-full px-3 py-2 rounded-lg bg-black/40 light-mode:bg-white border border-white/10 light-mode:border-slate-300 text-cyan-400 light-mode:text-slate-900 focus:outline-none focus:border-cyan-500 code-font text-sm">`;
            pType.options.forEach(opt => {
                html += `<option value="${opt}" class="bg-slate-900 text-white">${opt}</option>`;
            });
            html += `</select>`;
        } 
        else {
            html += `<input type="text" name="${paramName}" value="${inputValue}" oninput="updateLivePreview(${catIdx}, ${epIdx}, '${method}', '${path}', '${epType}')" class="w-full px-3 py-2 rounded-lg bg-black/40 light-mode:bg-white border border-white/10 light-mode:border-slate-300 text-white light-mode:text-slate-900 focus:outline-none focus:border-cyan-500 code-font text-sm" placeholder="${inputPlaceholder}" ${isRequired ? 'required' : ''}>`;
        }

        html += `</div>`;
    });
}
                
                html += `
                            </div>
                            <div class="flex gap-3">
                                <button type="submit" class="px-5 py-2 bg-cyan-500 light-mode:bg-cyan-600 hover:bg-cyan-400 light-mode:hover:bg-cyan-500 text-slate-950 light-mode:text-white rounded-md font-bold text-xs tracking-wider transition-all flex items-center justify-center">EKSEKUSI</button>
                                <button type="button" onclick="clearResponse(${catIdx}, ${epIdx}, '${epType}')" class="px-5 py-2 bg-transparent border border-white/20 light-mode:border-slate-300 hover:border-white/40 light-mode:hover:bg-slate-100 text-slate-300 light-mode:text-slate-700 rounded-md font-bold text-xs transition-colors">BERSIHKAN</button>
                            </div>
                        </form>

                        <div id="response-${catIdx}-${epIdx}" class="hidden mt-6 space-y-4">
                            <div>
                                <h5 class="text-[11px] uppercase tracking-wider font-bold mb-2 text-slate-400 light-mode:text-slate-500">Response</h5>
                                <div class="bg-slate-950/80 light-mode:bg-slate-100 border border-white/10 light-mode:border-slate-300 p-3 rounded-lg min-h-[100px] overflow-x-auto" id="response-content-${catIdx}-${epIdx}"></div>
                            </div>
                        </div>
                    </div>`;
            } else {
                html += `<div class="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-500 font-medium">${i18n[currentLang].endpointNotAvailable}</div>`;
            }
            html += `</div></div>`;
        });
        html += `</div></div></div>`;
    });
    apiList.innerHTML = html;
    allApiElements = Array.from(document.querySelectorAll('.api-item'));
}

function initMultiMusicPlayer() {
    const playlist = window.musicPlaylist || [];
    if (!playlist.length) return;

    let currentTrackIdx = 0;
    const audio = document.getElementById('audioElement');
    const playBtn = document.getElementById('playBtn');
    const playIcon = document.getElementById('playIcon');
    const progressBar = document.getElementById('progressBar');
    const progressContainer = document.getElementById('progressContainer');
    const currentTimeEl = document.getElementById('currentTime');
    const totalDurationEl = document.getElementById('totalDuration');
    const coverImg = document.getElementById('musicCoverImg');
    const titleEl = document.getElementById('musicTitle');
    const artistEl = document.getElementById('musicArtist');
    const playlistPanel = document.getElementById('playlistPanel');

    function formatTime(secs) {
        if (isNaN(secs)) return "0:00";
        const mins = Math.floor(secs / 60);
        const remainingSecs = Math.floor(secs % 60);
        return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
    }

    function loadTrack(index) {
        currentTrackIdx = index;
        const track = playlist[index];
        audio.src = track.url;
        titleEl.textContent = track.title;
        artistEl.textContent = track.artist;
        coverImg.src = track.cover;
        progressBar.style.width = '0%';
        currentTimeEl.textContent = '0:00';
        renderPlaylistItems();
    }

    function renderPlaylistItems() {
        playlistPanel.innerHTML = '';
        playlist.forEach((track, idx) => {
            const isActive = idx === currentTrackIdx;
            const itemBtn = document.createElement('button');
            itemBtn.className = `w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition-all ${isActive ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 light-mode:text-cyan-700 font-bold' : 'hover:bg-white/5 light-mode:hover:bg-black/5 text-slate-400 light-mode:text-slate-600'}`;
            itemBtn.innerHTML = `<div class="flex items-center gap-2 truncate"><span class="opacity-50 text-[10px] code-font">${String(idx + 1).padStart(2, '0')}</span><span class="truncate">${track.title} <span class="opacity-60 font-normal">- ${track.artist}</span></span></div>${isActive ? '<span class="text-[9px] tracking-wider text-cyan-500 bg-cyan-500/10 px-1.5 py-0.5 rounded animate-pulse font-bold">PLAYING</span>' : ''}`;
            itemBtn.addEventListener('click', () => {
                loadTrack(idx);
                audio.play().catch(e => console.log(e));
            });
            playlistPanel.appendChild(itemBtn);
        });
    }

    playBtn.addEventListener('click', () => { audio.paused ? audio.play() : audio.pause(); });
    audio.addEventListener('play', () => {
        playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        coverImg.classList.add('scale-105', 'rotate-3');
    });
    audio.addEventListener('pause', () => {
        playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
        coverImg.classList.remove('scale-105', 'rotate-3');
    });
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }
    });
    audio.addEventListener('loadedmetadata', () => { totalDurationEl.textContent = formatTime(audio.duration); });
    progressContainer.addEventListener('click', (e) => { if (audio.duration) audio.currentTime = (e.offsetX / progressContainer.clientWidth) * audio.duration; });
    document.getElementById('prevBtn').addEventListener('click', () => { loadTrack(currentTrackIdx - 1 < 0 ? playlist.length - 1 : currentTrackIdx - 1); audio.play(); });
    document.getElementById('nextBtn').addEventListener('click', () => { loadTrack(currentTrackIdx + 1 >= playlist.length ? 0 : currentTrackIdx + 1); audio.play(); });
    audio.addEventListener('ended', () => { loadTrack(currentTrackIdx + 1 >= playlist.length ? 0 : currentTrackIdx + 1); audio.play(); });
    document.getElementById('playlistToggleBtn').addEventListener('click', () => { playlistPanel.classList.toggle('hidden'); });

    loadTrack(0);
}

function initImageLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImage');
    const closeBtn = document.getElementById('closeLightbox');

    if (!lightbox || !lightboxImg) return;

    document.getElementById('apiList').addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG' && e.target.classList.contains('media-image')) {
            e.preventDefault();
            lightboxImg.src = e.target.src;
            lightbox.classList.remove('hidden');
            requestAnimationFrame(() => {
                lightbox.classList.remove('opacity-0');
                lightbox.classList.add('opacity-100');
                lightboxImg.classList.remove('scale-95');
                lightboxImg.classList.add('scale-100');
            });
        }
    });

    function hideLightbox() {
        lightbox.classList.remove('opacity-100');
        lightbox.classList.add('opacity-0');
        lightboxImg.classList.remove('scale-100');
        lightboxImg.classList.add('scale-95');
        setTimeout(() => {
            lightbox.classList.add('hidden');
            lightboxImg.src = '';
        }, 300);
    }

    if (closeBtn) closeBtn.addEventListener('click', hideLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.id === 'closeLightbox') {
            hideLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
            hideLightbox();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('lang') || 'id';

    initTheme();
    initBatteryDetection();
    initDigitalClock();
    initMultiMusicPlayer();
    initImageLightbox(); 
    setLanguage(savedLang);
    
    const uploaderBtn = document.getElementById('uploaderMenuBtn'); 
    const pastebinBtn = document.getElementById('pastebinMenuBtn'); 
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

    if (uploaderBtn) {
        uploaderBtn.addEventListener('click', () => {
            // MENGARAHKAN LANGSUNG KE ENDPOINT UPLOADER INTERNAL WEBSITE ANDA
            window.location.href = '/uploader'; 
        });
    }

    if (pastebinBtn) {
        pastebinBtn.addEventListener('click', () => {
            window.open('https://arulz-pastecode.vercel.app/', '_blank');
        });
    }

    // Fetch list data API dari backend
    fetch('/api/apilist')
        .then(res => res.json())
        .then(data => {
            apiData = data;
            loadApis(); // Jalankan fungsi render bawaan Anda
        })
        .catch(err => {
            const apiListEl = document.getElementById('apiList');
            if(apiListEl) {
               apiListEl.innerHTML = `<div class="text-center p-8 bg-red-900/20 border border-red-700 rounded-lg"><div class="text-4xl mb-4">⚠️</div><h3 class="font-bold text-lg mb-2">Failed to load API data</h3></div>`;
            }
        });
});

themeToggleBtn.addEventListener('click', toggleTheme);

let searchTimeout;
document.getElementById('searchInput').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 150);
});

window.addEventListener('beforeunload', cleanupBatteryMonitor);