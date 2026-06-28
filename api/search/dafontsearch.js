const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language":
        "en-US,en;q=0.5"
};

async function fetchHTML(url) {
    const { data } = await axios.get(url, {
        headers: HEADERS,
        timeout: 10000 // Mengurangi timeout sedikit agar tidak menggantung terlalu lama
    });

    return cheerio.load(data);
}

async function searchDafont(query) {
    try {
        const searchURL = `https://dafontstyle.io/?s=${encodeURIComponent(query)}`;
        const $ = await fetchHTML(searchURL);
        const items = [];

        $("#archive-container li.entry-list-item").each((_, el) => {
            const title = $(el).find("h2.entry-title a").text().trim();
            const link = $(el).find("h2.entry-title a").attr("href");
            const thumb = $(el).find(".post-thumbnail img").attr("src");
            const category = $(el).find(".category-links a").text().trim();

            if (title && link) {
                items.push({
                    title,
                    link,
                    thumb,
                    category
                });
            }
        });

        return items;
    } catch (err) {
        // Jika pencarian utama gagal/error, balikkan array kosong agar tidak crash 500
        return [];
    }
}

async function getDetail(url) {
    try {
        const $ = await fetchHTML(url);

        const title = $("h1.entry-title").text().trim();
        const download = $(".dfsp-container").attr("data-zip");
        const desc = $(".dfsp-description p").text().trim() || $('meta[name="description"]').attr("content");
        const image = $(".post-thumbnail img").attr("src") || $('meta[property="og:image"]').attr("content");
        const category = $(".category-links a").text().trim() || $('meta[property="article:section"]').attr("content");
        const published = $('meta[property="article:published_time"]').attr("content");
        const modified = $('meta[property="article:modified_time"]').attr("content");
        const author = $('meta[name="author"]').attr("content");

        const tags = [];
        $(".wp-block-kadence-advancedheading").each((_, el) => {
            const tag = $(el).text().trim();
            if (tag.startsWith("#")) {
                tags.push(...tag.split(/,\s*/).map(v => v.replace(/^#/, "").trim()));
            }
        });

        return {
            title,
            url,
            download,
            description: desc || null,
            previewImage: image || null,
            category: category || null,
            author: author || null,
            published: published || null,
            modified: modified || null,
            tags: tags.length > 0 ? tags : null
        };
    } catch (err) {
        // Jika salah satu halaman detail error, balikkan null alih-alih melempar error keras
        return null;
    }
}

router.get("/", async (req, res) => {
    try {
        const query = req.query.q?.trim();

        if (!query) {
            return res.status(400).json({
                status: false,
                creator: "ArulzXD",
                message: "Parameter q wajib diisi"
            });
        }

        const search = await searchDafont(query);

        if (!search.length) {
            return res.json({
                status: true,
                creator: "ArulzXD",
                query,
                count: 0,
                results: []
            });
        }

        // Jalankan fetch detail, kumpulkan hasil yang sukses, buang yang null (gagal fetch)
        const rawResults = await Promise.all(search.map(item => getDetail(item.link)));
        const results = rawResults.filter(item => item !== null);

        res.json({
            status: true,
            creator: "ArulzXD",
            query,
            count: results.length,
            fetchedAt: new Date().toISOString(),
            results
        });

    } catch (err) {
        res.status(500).json({
            status: false,
            creator: "ArulzXD",
            message: err.message || err
        });
    }
});

router.status = "ready"; 
router.type = "free";
module.exports = router;
