const express = require("express");
const axios = require("axios");

const router = express.Router();

const BASE_URL = "https://genmyart.com";
const AJAX_URL = "${BASE_URL}/wp-admin/admin-ajax.php";

const STYLES = [
"photorealistic",
"digital-art",
"impressionist",
"anime",
"fantasy",
"sci-fi",
"vintage",
"watercolor",
"ghibli",
"cyberpunk",
"surrealist",
"minimalist",
"baroque"
];

const RESOLUTIONS = [
"512x512",
"768x768",
"1024x1024",
"1280x720",
"1920x1080",
"2560x1440",
"3840x2160"
];

const ASPECT_RATIOS = [
"square",
"portrait",
"landscape"
];

async function getNonce() {
const res = await axios.get(BASE_URL, {
headers: {
"User-Agent":
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
});

const match = res.data.match(
    /_ajax_nonce:\s*'([a-f0-9]+)'/
);

if (!match) {
    throw new Error(
        "Nonce tidak ditemukan"
    );
}

return match[1];

}

async function generateImage(
prompt,
style = "photorealistic",
resolution = "1024x1024",
aspectRatio = "square",
numImages = 1
) {
const nonce = await getNonce();

const params =
    new URLSearchParams();

params.append(
    "action",
    "generate_ai_image"
);

params.append(
    "ai_prompt",
    prompt
);

params.append(
    "ai_style",
    style
);

params.append(
    "ai_resolution",
    resolution
);

params.append(
    "ai_aspect_ratio",
    aspectRatio
);

params.append(
    "ai_num_images",
    String(numImages)
);

params.append(
    "_ajax_nonce",
    nonce
);

const res = await axios.post(
    AJAX_URL,
    params.toString(),
    {
        headers: {
            "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With":
                "XMLHttpRequest",
            "Referer":
                BASE_URL,
            "User-Agent":
                "Mozilla/5.0"
        }
    }
);

if (!res.data.success) {
    throw new Error(
        res.data.message ||
        "Generate gagal"
    );
}

return res.data.images;

}

router.get("/", async (req, res) => {
try {
const prompt =
req.query.prompt?.trim();

    const style =
        req.query.style ||
        "photorealistic";

    const resolution =
        req.query.resolution ||
        "1024x1024";

    const aspectRatio =
        req.query.aspectRatio ||
        "square";

    const numImages =
        parseInt(
            req.query.numImages
        ) || 1;

    if (!prompt) {
        return res.status(400).json({
            status: false,
            creator: "ArulzXD",
            message:
                "Parameter prompt wajib diisi",
            example:
                "/api/ai/text2img?prompt=anime girl&style=anime&resolution=1024x1024&aspectRatio=square&numImages=1"
        });
    }

    const images =
        await generateImage(
            prompt,
            style,
            resolution,
            aspectRatio,
            numImages
        );

    res.json({
        status: true,
        creator: "ArulzXD",
        prompt,
        style,
        resolution,
        aspectRatio,
        total:
            images.length,
        result:
            images.map(img =>
                typeof img ===
                "string"
                    ? img
                    : img.url
            )
    });

} catch (err) {
    res.status(500).json({
        status: false,
        creator: "ArulzXD",
        message:
            err.message
    });
}

});
});

router.status = "ready";
router.type = "free";

module.exports = router;