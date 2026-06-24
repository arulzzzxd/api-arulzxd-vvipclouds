const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ======================================================
// CORE UPLOADER
// ======================================================
async function arulzUploader(file) {
    const form = new FormData();

    form.append("file", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
    });

    const { data } = await axios.post(
        "https://arulz-uploader.vercel.app/api/upload",
        form,
        {
            headers: {
                ...form.getHeaders(),
                "User-Agent": "Mozilla/5.0"
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        }
    );

    return data;
}

// ======================================================
// ENDPOINT POST
// ======================================================
router.post("/", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            status: false,
            error: "Missing file"
        });
    }

    try {
        const result = await arulzUploader(req.file);

        res.status(200).json({
            status: true,
            creator: "ArulzXD",
            filename: req.file.originalname,
            result
        });

    } catch (error) {
        const detail = error.response?.data || error.message;

        res.status(500).json({
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