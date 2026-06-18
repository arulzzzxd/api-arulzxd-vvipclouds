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

function wrapTextCenter(
    ctx,
    text,
    x,
    y,
    maxWidth,
    lineHeight
) {
    const words = text.split(" ");
    const lines = [];
    let line = "";

    for (const word of words) {
        const testLine = line + word + " ";

        if (
            ctx.measureText(testLine).width > maxWidth &&
            line.length > 0
        ) {
            lines.push(line.trim());
            line = word + " ";
        } else {
            line = testLine;
        }
    }

    if (line) {
        lines.push(line.trim());
    }

    const totalHeight =
        lines.length * lineHeight;

    let startY =
        y - totalHeight / 2;

    lines.forEach((txt, i) => {
        ctx.fillText(
            txt,
            x,
            startY + (i * lineHeight)
        );
    });
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
                message:
                    "Parameter username wajib"
            });
        }

        if (!caption) {
            return res.status(400).json({
                status: false,
                message:
                    "Parameter caption wajib"
            });
        }

        const bg = await loadImage(
            await getBuffer(BG_URL)
        );

        const avatar = await loadImage(
            await getBuffer(pp)
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

        // Foto profil
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

        // Username
        ctx.font = "28px Arial";
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        ctx.fillText(
            username,
            ppX + ppSize + 15,
            ppY + (ppSize / 2)
        );

        // Caption utama
        ctx.font = "bold 34px Arial";
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        wrapTextCenter(
            ctx,
            caption,
            canvas.width / 2,
            620,
            550,
            50
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