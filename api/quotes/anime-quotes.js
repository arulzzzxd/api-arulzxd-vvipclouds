const express = require("express");
const axios = require("axios");

const router = express.Router();

const JSON_URL =
  "https://raw.githubusercontent.com/arulzzzxd/database/main/quotes/anime-quotes.json";

router.get("/", async (req, res) => {
    try {
        const { data } = await axios.get(JSON_URL, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        let list = [];

        if (Array.isArray(data)) {
            list = data;
        } else if (Array.isArray(data.result)) {
            list = data.result;
        } else if (Array.isArray(data.data)) {
            list = data.data;
        } else {
            return res.status(500).json({
                status: false,
                creator: "ArulzXD",
                message: "Format JSON tidak dikenali."
            });
        }

        const result = list[Math.floor(Math.random() * list.length)];

        res.json({
            status: true,
            creator: "ArulzXD",
            result
        });

    } catch (err) {
        res.status(500).json({
            status: false,
            creator: "ArulzXD",
            message: err.response?.data || err.message
        });
    }
});

router.status = "ready";
router.type = "free";
module.exports = router;