const express = require("express");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();

async function removeBgimage(imageUrl) {
    const image = await axios.get(imageUrl, {
        responseType: "arraybuffer"
    });

    const buffer = Buffer.from(image.data);

    const form = new FormData();
    form.append("file", buffer, {
        filename: "image.png",
        contentType: "image/png"
    });
    form.append("type", "4");
    form.append("mattValue", "0");

    const { data: upload } = await axios.post(
        "https://bgeraser.com/api/bgeraser/legacy/upload",
        form,
        {
            headers: {
                ...form.getHeaders(),
                origin: "https://bgeraser.com",
                referer: "https://bgeraser.com/",
                "user-agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"
            }
        }
    );

    if (!upload.taskId) {
        throw new Error("Gagal mengupload gambar.");
    }

    const taskId = upload.taskId;

    for (let i = 0; i < 20; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const { data: status } = await axios.post(
            "https://bgeraser.com/api/bgeraser/legacy/status",
            {
                type: 4,
                codes: [taskId]
            },
            {
                headers: {
                    origin: "https://bgeraser.com",
                    referer: "https://bgeraser.com/",
                    "user-agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"
                }
            }
        );

        if (status.status === "success") {
            return {
                jobId: taskId,
                image: status.downloadUrls[taskId]
            };
        }
    }

    throw new Error("Timeout, proses remove background gagal.");
}

router.get("/", async (req, res) => {
    try {
        const apikey = req.query.apikey;
        const url = req.query.url;

        if (!apikey) {
            return res.status(403).json({
                status: false,
                message: "Parameter 'apikey' diperlukan."
            });
        }

        if (apikey !== "arulzxd-keys") {
            return res.status(403).json({
                status: false,
                message: "Apikey tidak valid."
            });
        }

        if (!url) {
            return res.status(400).json({
                status: false,
                message: "Parameter 'url' diperlukan.",
                example:
                    "/api/tools/removebg?apikey=arulzxd-keys&url=https://example.com/image.jpg"
            });
        }

        const result = await removeBgimage(url);

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