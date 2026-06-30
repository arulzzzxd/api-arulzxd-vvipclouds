const express = require("express");
const yts = require("yt-search");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const query = req.query.query;

        if (!query) {
            return res.status(400).json({
                status: false,
                message: "Masukkan parameter query"
            });
        }

        const search = await yts(query);

        const result = search.videos.map(v => ({
            type: v.type,
            videoId: v.videoId,
            title: v.title,
            url: v.url,
            timestamp: v.timestamp,
            duration: {
                seconds: v.seconds,
                timestamp: v.timestamp
            },
            views: v.views,
            ago: v.ago,
            author: {
                name: v.author.name,
                url: v.author.url
            },
            thumbnail: v.thumbnail
        }));

        res.json({
            status: true,
            creator: "ArulzXD",
            total: result.length,
            result
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