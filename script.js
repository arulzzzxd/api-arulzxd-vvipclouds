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
    'ai': '<svg viewBox=\"0 0 24 24\" fill=\"currentColor\" class=\"w-6 h-6 text-cyan-400\"><path d=\"M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 1 1 12 2zm-2 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm4 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z\"/></svg>',
    'downloader': '<svg viewBox=\"0 0 24 24\" fill=\"currentColor\" class=\"w-6 h-6 text-cyan-400\"><path d=\"M12 2a1 1 0 0 1 1 1v9.59l2.3-2.3a1 1 0 0 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.42l2.3 2.3V3a1 1 0 0 1 1-1zm7 15a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a1 1 0 0 1 2 0v2h12v-2a1 1 0 0 1 1-1z\"/></svg>',
    'tools': '<svg viewBox=\"0 0 24 24\" fill=\"currentColor\" class=\"w-6 h-6 text-cyan-400\"><path d=\"M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.7 4.3C.6 6.7 1 9.7 3 11.7c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.4-.4.4-1.1 0-1.5z\"/></svg>',
    'other': '<svg viewBox=\"0 0 24 24\" fill=\"currentColor\" class=\"w-6 h-6 text-cyan-400\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z\"/></svg>'
};

function updateClock() {
    const clockEl = document.getElementById('liveClock');
    const dateEl = document.getElementById('liveDate');
    if (!clockEl || !dateEl) return;

    // Atur locale moment berdasarkan bahasa aktif
    moment.locale(currentLang === 'id' ? 'id' : 'en');
    const jktTime = moment().tz('Asia/Jakarta');

    clockEl.textContent = jktTime.format('HH:mm:ss');
    
    // Perubahan penulisan struktur tanggal berdasarkan standarisasi bahasa
    if (currentLang === 'id') {
        dateEl.textContent = jktTime.format('dddd, DD MMMM YYYY');
    } else {
        dateEl.textContent = jktTime.format('dddd, MMMM DD, YYYY');
    }
}

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`lang-${lang}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Update bahasa di elemen UI statis pendukung jika diperlukan
    const placeholderText = lang === 'id' ? 'Cari endpoint berdasarkan nama, path, atau kategori...' : 'Search endpoints by name, path, or category...';
    document.getElementById('searchInput').placeholder = placeholderText;

    // Update Jam & Tanggal secara instan tanpa jeda
    updateClock();
    loadApis();
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    if (type === 'error') {
        toast.className = 'toast show border-red-500/30 bg-red-950/90 text-red-400 z-50';
        toastIcon.innerHTML = '<path fill-rule=\"evenodd\" d=\"M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z\" clip-rule=\"evenodd\"/>';
    } else {
        toast.className = 'toast show border-cyan-500/30 bg-cyan-950/90 text-cyan-400 z-50';
        toastIcon.innerHTML = '<path fill-rule=\"evenodd\" d=\"M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z\" clip-rule=\"evenodd\"/>';
    }

    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    if (currentTheme === 'light') {
        body.classList.add('light-mode');
        themeBg.className = 'fixed inset-0 -z-10 bg-dots-light';
    } else {
        body.classList.remove('light-mode');
        themeBg.className = 'fixed inset-0 -z-10 bg-dots-dark';
    }
}

function initBattery() {
    const bLevel = document.getElementById('batteryLevel');
    const bPerc = document.getElementById('batteryPercentage');
    const bStatus = document.getElementById('batteryStatus');

    if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
            batteryMonitor = battery;
            const updateBatteryUI = () => {
                const pct = Math.round(battery.level * 100);
                if (bLevel) bLevel.style.width = pct + '%';
                if (bPerc) bPerc.textContent = pct + '%';
                if (bStatus) {
                    bStatus.textContent = battery.charging 
                        ? (currentLang === 'id' ? 'Mengisi Daya' : 'Charging') 
                        : (currentLang === 'id' ? 'Discharging' : 'Unplugged');
                }
            };
            updateBatteryUI();
            battery.addEventListener('levelchange', updateBatteryUI);
            battery.addEventListener('chargingchange', updateBatteryUI);
        });
    }
}

function cleanupBattery() {
    if (batteryMonitor) {
        batteryMonitor.removeEventListener('levelchange', () => {});
        batteryMonitor.removeEventListener('chargingchange', () => {});
    }
}

function buildCategoryFilters() {
    const filterContainer = document.getElementById('categoryFilters');
    if (!filterContainer || !apiData || !apiData.categories) return;

    filterContainer.innerHTML = '';
    
    const allBtn = document.createElement('button');
    allBtn.className = `filter-btn ${activeCategory === 'all' ? 'active' : ''}`;
    allBtn.textContent = currentLang === 'id' ? 'SEMUA' : 'ALL';
    allBtn.onclick = () => filterByCategory('all');
    filterContainer.appendChild(allBtn);

    apiData.categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `filter-btn ${activeCategory === cat.name.toLowerCase() ? 'active' : ''}`;
        btn.textContent = cat.name;
        btn.onclick = () => filterByCategory(cat.name.toLowerCase());
        filterContainer.appendChild(btn);
    });
}

function filterByCategory(catName) {
    activeCategory = catName;
    buildCategoryFilters();
    performSearch();
}

function loadApis() {
    if (!apiData) return;

    const apiListContainer = document.getElementById('apiList');
    if (!apiListContainer) return;

    totalEndpoints = 0;
    totalCategories = apiData.categories ? apiData.categories.length : 0;

    document.getElementById('totalCategories').textContent = totalCategories;
    document.getElementById('totalRequests').textContent = apiData.totalRequestsToday || 0;

    apiListContainer.innerHTML = '';
    allApiElements = [];

    apiData.categories.forEach(category => {
        const catCard = document.createElement('div');
        catCard.className = 'glass-panel rounded-2xl p-4 shadow-xl border border-white/5 category-section mb-6';
        catCard.setAttribute('data-category', category.name.toLowerCase());

        const iconSvg = categoryIcons[category.name.toLowerCase()] || categoryIcons['other'];

        catCard.innerHTML = `
            <div class="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                <div class="w-10 h-10 rounded-xl bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center shadow-inner">
                    ${iconSvg}
                </div>
                <div>
                    <h2 class="text-sm font-black tracking-wider text-cyan-400 light-mode:text-cyan-600 font-['Space_Grotesk']">${category.name}</h2>
                    <p class="text-[10px] uppercase tracking-widest text-slate-400 light-mode:text-slate-500 font-bold mt-0.5">${category.items.length} Endpoints AVAILABLE</p>
                </div>
            </div>
            <div class="space-y-3 item-container"></div>
        `;

        const itemContainer = catCard.querySelector('.item-container');

        category.items.forEach(item => {
            totalEndpoints++;
            const itemRow = document.createElement('div');
            itemRow.className = 'api-item group border border-white/5 rounded-xl bg-slate-900/20 light-mode:bg-slate-50/50 p-3 hover:border-cyan-500/30 hover:bg-cyan-950/10 transition-all duration-200';
            
            const methodBadge = item.methods && item.methods[0] ? item.methods[0] : 'GET';
            let badgeColor = 'bg-green-500/10 text-green-400 border-green-500/20';
            if (methodBadge === 'POST') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

            itemRow.innerHTML = `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex items-start gap-2.5 min-w-0 flex-1">
                        <span class="px-2 py-0.5 text-[9px] font-extrabold border rounded-md uppercase tracking-wide h-fit mt-0.5 ${badgeColor}">${methodBadge}</span>
                        <div class="min-w-0 flex-1">
                            <h4 class="text-xs font-bold text-slate-200 light-mode:text-slate-800 font-mono tracking-tight truncate">${item.name}</h4>
                            <p class="text-[11px] font-medium text-slate-400 light-mode:text-slate-500 truncate mt-0.5">${item.desc}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-1.5 self-end sm:self-center">
                        <button class="btn-api bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95" onclick="fireEndpoint('${item.path}', ${JSON.stringify(item.params || {})})">FIRE</button>
                    </div>
                </div>
                <div class="param-panel hidden mt-3 pt-3 border-t border-white/5 space-y-3 font-['Space_Grotesk']"></div>
            `;

            itemContainer.appendChild(itemRow);
            allApiElements.push({
                element: itemRow,
                name: item.name.toLowerCase(),
                path: item.path.toLowerCase(),
                desc: item.desc.toLowerCase(),
                category: category.name.toLowerCase()
            });
        });

        apiListContainer.appendChild(catCard);
    });

    document.getElementById('totalEndpoints').textContent = totalEndpoints;
    buildCategoryFilters();
    performSearch();
}

function performSearch() {
    const q = document.getElementById('searchInput').value.toLowerCase().trim();
    const noResults = document.getElementById('noResults');
    let totalVisible = 0;

    const sections = document.querySelectorAll('.category-section');
    sections.forEach(sec => {
        const secCat = sec.getAttribute('data-category');
        const rows = sec.querySelectorAll('.api-item');
        let visibleInSection = 0;

        rows.forEach(row => {
            const rowData = allApiElements.find(x => x.element === row);
            if (!rowData) return;

            const matchesCategory = (activeCategory === 'all' || rowData.category === activeCategory);
            const matchesQuery = (!q || rowData.name.includes(q) || rowData.path.includes(q) || rowData.desc.includes(q));

            if (matchesCategory && matchesQuery) {
                row.classList.remove('hidden');
                visibleInSection++;
                totalVisible++;
            } else {
                row.classList.add('hidden');
            }
        });

        if (visibleInSection > 0) {
            sec.classList.remove('hidden');
        } else {
            sec.classList.add('hidden');
        }
    });

    if (totalVisible === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
    }
}

function fireEndpoint(path, params) {
    if (isRequestInProgress) return;

    // Cari element item baris terkait parameter yang diklik
    const targetItem = allApiElements.find(x => x.path === path.toLowerCase());
    if (!targetItem) return;

    const paramPanel = targetItem.element.querySelector('.param-panel');
    if (!paramPanel) return;

    // Toggle Sembunyikan Panel Parameter Jika diklik ulang
    if (!paramPanel.classList.contains('hidden')) {
        paramPanel.classList.add('hidden');
        paramPanel.innerHTML = '';
        return;
    }

    paramPanel.innerHTML = '';
    paramPanel.classList.remove('hidden');

    const paramKeys = Object.keys(params);

    if (paramKeys.length === 0) {
        // Jika tidak butuh parameter input, langsung eksekusi request ke tab baru
        paramPanel.classList.add('hidden');
        window.open(`${BASE_URL}${path}`, '_blank');
        return;
    }

    // Mengonstruksi Input Form Parameter secara Dinamis
    const formWrapper = document.createElement('div');
    formWrapper.className = 'space-y-2.5 max-w-md';

    paramKeys.forEach(key => {
        const label = document.createElement('label');
        label.className = 'block text-[11px] font-bold uppercase tracking-wider text-slate-300 light-mode:text-slate-600 mb-1';
        label.textContent = `Parameter: ${key}`;

        const input = document.createElement('input');
        input.type = 'text';
        input.name = key;
        input.placeholder = key === 'apikey' ? 'Masukkan ApiKey...' : `Isi nilai ${key}...`;
        input.className = 'w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 light-mode:bg-white light-mode:text-slate-900 light-mode:border-slate-200';

        // Autocomplete default key jika ada isian apikey
        if (key === 'apikey') {
            input.value = 'arulzxd-keys';
        }

        const container = document.createElement('div');
        container.appendChild(label);
        container.appendChild(input);
        formWrapper.appendChild(container);
    });

    const submitBtn = document.createElement('button');
    submitBtn.className = 'mt-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase rounded-lg tracking-wider shadow active:scale-95 transition-all';
    submitBtn.textContent = currentLang === 'id' ? 'KIRIM REQUEST' : 'SUBMIT REQUEST';

    submitBtn.onclick = () => {
        const inputs = formWrapper.querySelectorAll('input');
        const queryParts = [];
        inputs.forEach(inp => {
            if (inp.value.trim() !== '') {
                queryParts.push(`${inp.name}=${encodeURIComponent(inp.value.trim())}`);
            }
        });

        const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
        window.open(`${BASE_URL}${path}${queryString}`, '_blank');
    };

    formWrapper.appendChild(submitBtn);
    paramPanel.appendChild(formWrapper);
}

// ==================== LAYANAN PLAYLIST MUSIK NYATA ====================
let currentTrackIndex = 0;
let isMusicPlaying = false;
const audio = document.getElementById('audioElement');

function initMusicPlayer() {
    if (!window.musicPlaylist || !window.musicPlaylist.length) return;

    const playBtn = document.getElementById('playBtn');
    const playIcon = document.getElementById('playIcon');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const playlistToggleBtn = document.getElementById('playlistToggleBtn');
    const playlistPanel = document.getElementById('playlistPanel');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');

    function loadTrack(index) {
        const track = window.musicPlaylist[index];
        if (!track) return;

        audio.src = track.url;
        document.getElementById('musicTitle').textContent = track.title;
        document.getElementById('musicArtist').textContent = track.artist;
        document.getElementById('musicCoverImg').src = track.cover;
        
        // Tandai lagu aktif di panel daftar
        document.querySelectorAll('.playlist-item').forEach((item, idx) => {
            if (idx === index) {
                item.classList.add('bg-cyan-500/10', 'text-cyan-400');
            } else {
                item.classList.remove('bg-cyan-500/10', 'text-cyan-400');
            }
        });
    }

    function togglePlay() {
        if (!audio.src) loadTrack(currentTrackIndex);
        if (isMusicPlaying) {
            audio.pause();
            playIcon.innerHTML = '<path d=\"M8 5v14l11-7z\"/>';
            isMusicPlaying = false;
        } else {
            audio.play().then(() => {
                playIcon.innerHTML = '<path d=\"M6 19h4V5H6v14zm8-14v14h4V5h-4z\"/>';
                isMusicPlaying = true;
            }).catch(e => {
                showToast('Gagal memutar audio, berkas rusak.', 'error');
            });
        }
    }

    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + window.musicPlaylist.length) % window.musicPlaylist.length;
        loadTrack(currentTrackIndex);
        if (isMusicPlaying) audio.play();
    });
    nextBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex + 1) % window.musicPlaylist.length;
        loadTrack(currentTrackIndex);
        if (isMusicPlaying) audio.play();
    });

    audio.addEventListener('timeupdate', () => {
        const cur = audio.currentTime;
        const dur = audio.duration || 0;
        if (dur > 0) {
            const pct = (cur / dur) * 100;
            progressBar.style.width = pct + '%';

            // Hitung format menit : detik
            const curM = Math.floor(cur / 60);
            const curS = Math.floor(cur % 60).toString().padStart(2, '0');
            const durM = Math.floor(dur / 60);
            const durS = Math.floor(dur % 60).toString().padStart(2, '0');

            document.getElementById('currentTime').textContent = `${curM}:${curS}`;
            document.getElementById('totalDuration').textContent = `${durM}:${durS}`;
        }
    });

    audio.addEventListener('ended', () => {
        currentTrackIndex = (currentTrackIndex + 1) % window.musicPlaylist.length;
        loadTrack(currentTrackIndex);
        audio.play();
    });

    progressContainer.addEventListener('click', (e) => {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration || 0;
        if (duration > 0) {
            audio.currentTime = (clickX / width) * duration;
        }
    });

    // Membuat item daftar lagu di panel playlist
    window.musicPlaylist.forEach((track, idx) => {
        const pItem = document.createElement('div');
        pItem.className = 'playlist-item flex items-center justify-between text-left text-xs p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors font-semibold tracking-wide uppercase';
        pItem.innerHTML = `
            <div class=\"truncate pr-4\">
                <span class=\"block truncate text-slate-200 light-mode:text-slate-800\">${track.title}</span>
                <span class=\"block text-[10px] text-slate-400 light-mode:text-slate-500 truncate mt-0.5\">${track.artist}</span>
            </div>
            <span class=\"text-[10px] opacity-60 font-mono\">AUDIO</span>
        `;
        pItem.onclick = () => {
            currentTrackIndex = idx;
            loadTrack(idx);
            if (!isMusicPlaying) togglePlay();
            else audio.play();
        };
        playlistPanel.appendChild(pItem);
    });

    playlistToggleBtn.addEventListener('click', () => {
        playlistPanel.classList.toggle('hidden');
    });

    loadTrack(currentTrackIndex);
}

// Sidebar Dropdown Navigasi
function closeSidebarMenu() {
    document.getElementById('bioDropdown').style.transform = 'translateX(100%)';
    document.getElementById('menuOverlay').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    initBattery();
    initMusicPlayer();

    setInterval(updateClock, 1000);
    updateClock();

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
            document.getElementById('apiList').innerHTML = `<div class=\"text-center p-8 bg-red-900/20 border border-red-700 rounded-lg\"><div class=\"text-4xl mb-4\">⚠️</div><h3 class=\"font-bold text-lg mb-2\">Failed to load API data</h3></div>`;
        });
});

themeToggleBtn.addEventListener('click', toggleTheme);

let searchTimeout;
document.getElementById('searchInput').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 150);
});

window.addEventListener('beforeunload', cleanupBattery);