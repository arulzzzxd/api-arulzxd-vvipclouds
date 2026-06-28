const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const query = req.query.q?.trim();

        // Validasi parameter pencarian
        if (!query) {
            return res.status(400).json({
                status: false,
                message: "Parameter 'q' (keyword pencarian) wajib diisi"
            });
        }

        // Request ke halaman pencarian Dafont
        const response = await axios.get(`https://www.dafont.com/search.php`, {
            params: { q: query },
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        const $ = cheerio.load(response.data);
        const results = [];

        // Loop setiap kontainer font yang ditemukan
        $(".gif_box").each((index, element) => {
            const fontZone = $(element).prev(".fontzone");
            
            // Mengambil nama font dan author
            const titleText = fontZone.find(".lv1left").text().trim();
            // Format teks biasanya: "Font Name by Author"
            const nameParts = titleText.split(" by ");
            const fontName = nameParts[0] || "Unknown";
            const author = nameParts[1] || "Unknown";

            // Mengambil info total download
            const infoText = fontZone.find(".lv1right").text().trim();
            const downloadCount = infoText.match(/[\d,]+/)?.[0] || "0";

            // Mengambil URL preview gambar teks font
            const previewImg = $(element).find(".dl").attr("src");
            const previewUrl = previewImg ? `https://www.dafont.com/${previewImg}` : null;

            // Mengambil ID font untuk mengonstruksi link download file .zip
            const downloadHref = $(element).find(".dl2").attr("href");
            let downloadLink = null;
            if (downloadHref) {
                const fontId = downloadHref.match(/id=(\d+)/)?.[1];
                if (fontId) {
                    downloadLink = `https://dl.dafont.com/dl/?f=${fontId}`;
                }
            }

            // Mengambil informasi lisensi (Free, Personal use, dll)
            const license = $(element).find(".licence").text().trim() || "Unknown";

            results.push({
                name: fontName,
                author: author,
                total_downloads: downloadCount,
                license: license,
                preview_image: previewUrl,
                download_zip: downloadLink
            });
        });

        // Kirim response JSON hasil penelusuran
        res.json({
            status: true,
            total_results: results.length,
            results: results
        });

    } catch (err) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
});

router.status = "ready";
router.type = "free";
module.exports = router;
