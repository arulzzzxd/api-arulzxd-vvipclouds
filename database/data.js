const data = [
    {
    "id": 1782746459429,
    "title": "Aio-Download",
    "language": "scrape",
    "desc": "By arulzxd",
    "date": "29 Jun 2026",
    "content": "const axios = require('axios');\n\nasync function aioDownloader(targetUrl) {\n    const apiUrl = 'https://api-arulzxd-vvipclouds.vercel.app/api/download/aio-downloader';\n    \n    try {\n        console.log('Sedang mengambil data unduhan...');\n        const response = await axios.get(apiUrl, {\n            params: {\n                url: targetUrl,          // URL video/media yang mau di-download\n                apikey: 'arulzxd-keys'   // Apikey dari dokumentasi webmu\n            },\n            headers: {\n                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'\n            }\n        });\n\n        return response.data;\n    } catch (error) {\n        console.error('Error saat scraping AIO Downloader:', error.message);\n        throw error;\n    }\n}\n\n// Contoh Penggunaan (Ganti targetUrl dengan link sosmed yang mau kamu tes):\nconst targetUrl = 'https://www.instagram.com/p/C_example_link/'; \naioDownloader(targetUrl)\n    .then(data => {\n        console.log('Hasil Scrape:', JSON.stringify(data, null, 2));\n    })\n    .catch(err => {\n        console.log('Gagal memproses scraper.');\n    });\n"
}
];
