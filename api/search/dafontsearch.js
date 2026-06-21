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
        timeout: 15000
    });

    return cheerio.load(data);
}

async function searchDafont(query) {
    const searchURL =
        `https://dafontstyle.io/?s=${encodeURIComponent(query)}`;

    const $ = await fetchHTML(searchURL);

    const items = [];

    $("#archive-container li.entry-list-item").each(
        (_, el) => {
            const title = $(el)
                .find("h2.entry-title a")
                .text()
                .trim();

            const link = $(el)
                .find("h2.entry-title a")
                .attr("href");

            const thumb = $(el)
                .find(".post-thumbnail img")
                .attr("src");

            const category = $(el)
                .find(".category-links a")
                .text()
                .trim();

            if (title && link) {
                items.push({
                    title,
                    link,
                    thumb,
                    category
                });
            }
        }
    );

    return items;
}

async function getDetail(url) {
    const $ = await fetchHTML(url);

    const title =
        $("h1.entry-title")
            .text()
            .trim();

    const download =
        $(".dfsp-container")
            .attr("data-zip");

    const desc =
        $(".dfsp-description p")
            .text()
            .trim() ||
        $('meta[name="description"]')
            .attr("content");

    const image =
        $(".post-thumbnail img")
            .attr("src") ||
        $('meta[property="og:image"]')
            .attr("content");

    const category =
        $(".category-links a")
            .text()
            .trim() ||
        $('meta[property="article:section"]')
            .attr("content");

    const published =
        $('meta[property="article:published_time"]')
            .attr("content");

    const modified =
        $('meta[property="article:modified_time"]')
            .attr("content");

    const author =
        $('meta[name="author"]')
            .attr("content");

    const tags = [];

    $(".wp-block-kadence-advancedheading").each(
        (_, el) => {
            const tag = $(el)
                .text()
                .trim();

            if (tag.startsWith("#")) {
                tags.push(
                    ...tag
                        .split(/,\s*/)
                        .map(v =>
                            v.replace(/^#/, "").trim()
                        )
                );
            }
        }
    );

    return {
        title,
        url,
        download,
        description: desc,
        previewImage: image,
        category,
        author,
        published,
        modified,
        tags:
            tags.length > 0
                ? tags
                : null
    };
}

router.get("/", async (req, res) => {
    try {
        const query =
            req.query.q?.trim();

        if (!query) {
            return res.status(400).json({
                status: false,
                message:
                    "Parameter q wajib"
            });
        }

        const search =
            await searchDafont(query);

        if (!search.length) {
            return res.json({
                status: true,
                query,
                count: 0,
                results: []
            });
        }

        const results =
            await Promise.all(
                search.map(item =>
                    getDetail(item.link)
                )
            );

        res.json({
            status: true,
            query,
            count: results.length,
            fetchedAt:
                new Date().toISOString(),
            results
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