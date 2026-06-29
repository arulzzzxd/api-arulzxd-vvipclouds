const data = [
    {
    "id": 1782744197386,
    "title": "Tiktokdlv1",
    "language": "scrape",
    "desc": "By arulzxd",
    "date": "29 Jun 2026",
    "content": "const axios = require('axios');\n\nasync function tiktokScraper(tiktokUrl) {\n    const apiUrl = 'https://api-arulzxd-vvipclouds.vercel.app/api/download/ttdl';\n    \n    try {\n        const response = await axios.get(apiUrl, {\n            params: {\n                url: tiktokUrl // Menambahkan parameter URL TikTok\n            },\n            headers: {\n                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'\n            }\n        });\n\n        return response.data;\n    } catch (error) {\n        console.error('Error saat scraping:', error.message);\n        throw error;\n    }\n}\n\n// Contoh Penggunaan:\nconst targetUrl = 'https://www.tiktok.com/@khaby.lame/video/7123456789012345678';\ntiktokScraper(targetUrl)\n    .then(data => console.log('Hasil Scrape:', data))\n    .catch(err => console.log('Gagal mengambil data.'));\n"
},
{
    "id": 1782745376877,
    "title": "Random BlueArcive",
    "language": "scrape",
    "desc": "By arulzxd",
    "date": "29 Jun 2026",
    "content": "const axios = require('axios');\nconst fs = require('fs');\nconst path = require('path');\n\nasync function randomba() {\n    const apiUrl = 'https://api-arulzxd-vvipclouds.vercel.app/api/random/ba';\n    const outputFilename = `blue_archive_${Date.now()}.png`; // Disimpan sebagai PNG sesuai gambar\n\n    try {\n        console.log('Sedang mengambil gambar...');\n        \n        const response = await axios.get(apiUrl, {\n            params: {\n                apikey: 'arulzxd-keys' // Menambahkan apikey wajib dari gambar\n            },\n            responseType: 'stream', // Karena outputnya langsung file gambar\n            headers: {\n                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'\n            }\n        });\n\n        // Alirkan data gambar langsung ke file\n        const writer = fs.createWriteStream(path.join(__dirname, outputFilename));\n        response.data.pipe(writer);\n\n        writer.on('finish', () => {\n            console.log(` Sukses! Gambar berhasil disimpan sebagai: ${outputFilename}`);\n        });\n\n        writer.on('error', (err) => {\n            console.error('Gagal menulis file gambar:', err);\n        });\n\n    } catch (error) {\n        console.error('Terjadi error saat scraping:', error.message);\n    }\n}\n\nrandomba();\n"
}
];
