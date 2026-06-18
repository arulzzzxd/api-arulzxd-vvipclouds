const express = require("express");
const axios = require("axios");
const { createCanvas, loadImage } = require("@napi-rs/canvas");

const router = express.Router();

const BG_URL = "https://files.catbox.moe/3gwr1l.jpg";
const DEFAULT_PP = "https://img1.pixhost.to/images/5831/600387261_biyu-offc.jpg";

async function getBuffer(url) {
    const { data } = await axios.get(url, {
        responseType: "arraybuffer"
    });

    return Buffer.from(data);
}

function drawMultilineText(
    ctx,
    text,
    x,
    centerY,
    maxWidth,
    lineHeight
) {
    const words = text.split(" ");
    const lines = [];
    let line = "";

    for (const word of words) {
        const test = line + word + " ";

        if (
            ctx.measureText(test).width > maxWidth &&
            line
        ) {
            lines.push(line.trim());
            line = word + " ";
        } else {
            line = test;
        }
    }

    if (line) lines.push(line.trim());

    const totalHeight =
        lines.length * lineHeight;

    let y =
        centerY -
        totalHeight / 2 +
        lineHeight / 2;

    for (const txt of lines) {
        ctx.strokeText(txt, x, y);
        ctx.fillText(txt, x, y);
        y += lineHeight;
    }
}

router.get("/", async (req, res) => {
    try {
        const username =
            req.query.username?.trim();

        const caption =
            req.query.caption?.trim();

        const pp =
            req.query.pp?.trim() ||
            DEFAULT_PP;

        if (!username) {
            return res.status(400).json({
                status: false,
                message: "Parameter username wajib"
            });
        }

        if (!caption) {
            return res.status(400).json({
                status: false,
                message: "Parameter caption wajib"
            });
        }

        const bg = await loadImage(
            await getBuffer(BG_URL)
        );

        const avatar = await loadImage(
            await getBuffer(pp)
        );

        const canvas = createCanvas(
            bg.width,
            bg.height
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

        // Avatar
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
        ctx.clip();

        ctx.drawImage(
            avatar,
            ppX,
            ppY,
            ppSize,
            ppSize
        );

        ctx.restore();

        // Username
        ctx.font = "28px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        ctx.fillText(
            username,
            ppX + ppSize + 15,
            ppY + ppSize / 2
        );

        // Caption
        ctx.font = "bold 40px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 5;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        drawMultilineText(
            ctx,
            caption,
            canvas.width / 2,
            canvas.height / 2,
            520,
            55
        );

        const buffer =
            await canvas.encode("png");

        res.setHeader(
            "Content-Type",
            "image/png"
        );

        res.end(buffer);

    } catch (err) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
});

module.exports = router;