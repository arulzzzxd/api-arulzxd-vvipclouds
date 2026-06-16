const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

// ======================================================
// UTILITY / HELPER FUNCTIONS
// ======================================================

// Mengonversi string ukuran file ke angka biner
function parseFileSize(size) {
    return parseFloat(size) * (/GB/i.test(size)
        ? 1000000
        : /MB/i.test(size)
            ? 1000
            : /KB/i.test(size)
                ? 1
                : /bytes?/i.test(size)
                    ? 0.001
                    : /B/i.test(size)
                        ? 0.1
                        : 0);
}

// Mengambil ukuran file langsung dari header link unduhan
async function getFileSize(downloadLink) {
    if (!downloadLink) return '0';
    try {
        const response = await axios.head(downloadLink, { timeout: 5000 });
        const contentLength = response.headers['content-length'];

        if (contentLength) {
            const fileSizeInBytes = parseInt(contentLength);

            if (fileSizeInBytes < 1024) {
                return `${fileSizeInBytes} bytes`;
            } else if (fileSizeInBytes < 1024 * 1024) {
                const fileSizeInKb = fileSizeInBytes / 1024;
                return `${fileSizeInKb.toFixed(2)} KB`;
            } else if (fileSizeInBytes < 1024 * 1024 * 1024) {
                const fileSizeInMb = fileSizeInBytes / (1024 * 1024);
                return `${fileSizeInMb.toFixed(2)} MB`;
            } else {
                const fileSizeInGb = fileSizeInBytes / (1024 * 1024 * 1024);
                return `${fileSizeInGb.toFixed(2)} GB`;
            }
        }
        return 'Unknown';
    } catch (error) {
        return 'Error';
    }
}

// Fungsi utama Scraper XNXX Downloader
async function xnxxdl(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const scriptContent = $('script').filter((i, el) => {
            return $(el).html().includes('html5player.setVideoUrlLow');
        }).html();

        if (!scriptContent) {
            throw new Error("Gagal menemukan data video script pada halaman XNXX.");
        }

        const title = $('meta[property="og:title"]').attr('content') || $('.video-title').text().trim() || "XNXX Video";
        const duration = $('.duration').text().trim() || "Unknown";

        const url_low = scriptContent.match(/html5player\.setVideoUrlLow\('([^']+)'\)/)?.[1];
        const url_high = scriptContent.match(/html5player\.setVideoUrlHigh\('([^']+)'\)/)?.[1];
        const url_hsl = scriptContent.match(/html5player\.setVideoHLS\('([^']+)'\)/)?.[1];

        const [size_low, size_high] = await Promise.all([
            getFileSize(url_low),
            getFileSize(url_high)
        ]);

        return {
            title,
            duration,
            downloads: {
                low: {
                    url: url_low,
                    size: size_low,
                    sizeB: parseFileSize(size_low)
                },
                high: {
                    url: url_high,
                    size: size_high,
                    sizeB: parseFileSize(size_high)
                },
                hsl: {
                    url: url_hsl,
                    size: "Variable (Streaming)",
                    sizeB: 0
                }
            }
        };
    } catch (error) {
        throw error;
    }
}

// ======================================================
// ENDPOINT GET UTAMA
// ======================================================
router.get('/', async (req, res) => {
    const apikey = req.query.apikey;
    const url = req.query.url;

    // 1. Validasi keberadaan API Key
    if (!apikey) {
        return res.status(403).json({
            status: false,
            creator: "Arulzxd",
            message: "API Key mana? masukkan parameter ?apikey=MasukkanApiKey"
        });
    }

    // 2. Validasi kecocokan nilai API Key
    if (apikey !== 'arulzxd-keys') {
        return res.status(403).json({
            status: false,
            creator: "Arulzxd",
            message: "API Key salah / tidak valid!"
        });
    }

    // 3. Validasi parameter URL
    if (!url) {
        return res.status(400).json({
            status: false,
            creator: "Arulzxd",
            message: "Parameter 'url' wajib diisi! Contoh: ?apikey=arulzxd-keys&url=https://www.xnxx.com/video-xxxxxx/..."
        });
    }

    try {
        const result = await xnxxdl(url);

        return res.status(200).json({
            status: true,
            creator: 'Arulzxd',
            result,
            metadata: {
                source: 'XNXX Downloader',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            creator: 'Arulzxd',
            message: 'Gagal mengambil data video XNXX',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;