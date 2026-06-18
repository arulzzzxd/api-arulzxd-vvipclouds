const express = require("express");
const { createCanvas, loadImage } = require("@napi-rs/canvas");
const axios = require("axios");

const router = express.Router();

const BG_URL = "https://files.catbox.moe/3gwr1l.jpg";
const DEFAULT_PP = "https://img1.pixhost.to/images/5831/600387261_biyu-offc.jpg";

function wrapTextCenter(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    const lines = [];

    for (const word of words) {
        const testLine = line + word + " ";

        if (
            ctx.measureText(testLine).width > maxWidth &&
            line.length > 0
        ) {
            lines.push(line);
            line = word + " ";
        } else {
            line = testLine;
        }
    }

    lines.push(line);

    lines.forEach((txt, i) => {
        ctx.fillText(
            txt.trim(),
            x,
            y + (i * lineHeight)
        );
    });
}

async function getBuffer(url) {
    const { data } = await axios.get(url, {
        responseType: "arraybuffer"
    });

    return Buffer.from(data);
}

router.get("/", async (req, res) => {
    try {
        const {
            username,
            caption,
            pp
        } = req.query;

        if (!username || !caption) {
            return res.status(400).json({
                status: false,
                message:
                    "Parameter username & caption wajib"
            });
        }

        const bg = await loadImage(
            await getBuffer(BG_URL)
        );

        const avatar = await loadImage(
            await getBuffer(pp || DEFAULT_PP)
        );

        const canvas = createCanvas(
            720,
            1280
        );

        const ctx =
            canvas.getContext("2d");

        ctx.drawImage(
            bg,
            0,
            0,
            canvas.width,
            canvas.height
        );

        const ppX = 40;
        const ppY = 250;
        const ppSize = 70;

        ctx.save();
        ctx.beginPath();
        ctx.arc(
            ppX + ppSize / 2,
            ppY + ppSize / 2,
            ppSize / 2,
            0,
            Math.PI * 2
        );
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(
            avatar,
            ppX,
            ppY,
            ppSize,
            ppSize
        );

        ctx.restore();

        ctx.font = "28px Arial";
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        ctx.fillText(
            username,
            ppX + ppSize + 15,
            ppY + ppSize / 2
        );

        ctx.font = "bold 30px Arial";
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        wrapTextCenter(
            ctx,
            caption,
            canvas.width / 2,
            canvas.height - 650,
            canvas.width - 100,
            42
        );

        const buffer =
            await canvas.encode("png");

        res.setHeader(
            "Content-Type",
            "image/png"
        );

        res.send(buffer);

    } catch (err) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
});

module.exports = router;