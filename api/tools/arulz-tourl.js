const express = require("express");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();

async function arulzUploader(fileUrl) {
    const file = await axios.get(fileUrl, {
        responseType: "arraybuffer"
    });

    const ext = fileUrl.split(".").pop().split("?")[0] || "bin";

    const form = new FormData();
    form.append(
        "file",
        Buffer.from(file.data),
        `upload.${ext}`
    );

    const { data } = await axios.post(
        "https://arulz-uploader.vercel.app/api/upload",
        form,
        {
            headers: {
                ...form.getHeaders(),
                "User-Agent": "Mozilla/5.0"
            }
        }
    );

    return data;
}

router.post("/", async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({
            status: false,
            error: "Missing 'url' parameter"
        });
    }

    try {
        const result = await arulzUploader(url);

        return res.status(200).json({
            status: true,
            creator: "ArulzXD",
            result
        });

    } catch (error) {
        const detail = error.response?.data || error.message;

        return res.status(500).json({
            status: false,
            error: typeof detail === "object"
                ? JSON.stringify(detail)
                : detail
        });
    }
});

router.status = "ready";
router.type = "free";

module.exports = router;