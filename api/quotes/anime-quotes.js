const express = require("express");
const axios = require("axios");

const router = express.Router();

const JSON_URL =
    "https://raw.githubusercontent.com/arulzzzxd/database/main/quotes/anime-quotes.json";

router.get("/", async (req, res) => {
    try {
        const { data } = await axios.get(JSON_URL);

        if (!Array.isArray(data)) {
            return res.status(500).json({
                status: false,
                creator: "ArulzXD",
                message: "Format database tidak valid."
            });
        }

        const result =
            data[Math.floor(Math.random() * data.length)];

        res.json({
            status: true,
            creator: "ArulzXD",
            result
        });

    } catch (err) {
        res.status(500).json({
            status: false,
            creator: "ArulzXD",
            message: err.message
        });
    }
});

router.status = "ready";
router.type = "free";

module.exports = router;
