const express = require("express");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const fetch = require("node-fetch");

const router = express.Router();

const BRAT_IMAGE_URL = "https://files.catbox.moe/wlvb0g.png";
const BRAT_FONT_URL = "https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/Brat/Poppins.ttf";

const CANVAS = {
    width: 1254,
    height: 1254
};

// AREA KERTAS
const SAFE_ZONE = {
    top: 785,
    bottom: 980,
    left: 430,
    right: 830
};


const TEXT_STYLE = {
    fontFamily: "PoppinsBratGojo",
    maxFontSize: 82,
    minFontSize: 18,
    lineHeight: 1.22,
    color: "#111111"
};
async function downloadBuffer(url) {
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Download gagal: ${res.status}`);
    }

    return Buffer.from(await res.arrayBuffer());
}

function normalizeText(text) {
    return String(text || "")
        .replace(/\r/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function setFont(ctx, size) {
    ctx.font = `${size}px ${TEXT_STYLE.fontFamily}`;
}

function splitLongWord(ctx, word, maxWidth) {
    const chars = [...word];
    const result = [];
    let current = "";

    for (const char of chars) {
        const test = current + char;

        if (
            ctx.measureText(test).width <= maxWidth ||
            current.length === 0
        ) {
            current = test;
        } else {
            result.push(current);
            current = char;
        }
    }

    if (current) result.push(current);

    return result;
}

function wrapParagraph(ctx, text, maxWidth) {
    const words = text.split(" ").filter(Boolean);

    const lines = [];
    let current = "";

    for (const word of words) {
        const test = current
            ? current + " " + word
            : word;

        if (ctx.measureText(test).width <= maxWidth) {
            current = test;
            continue;
        }

        if (current) {
            lines.push(current);
            current = "";
        }

        if (
            ctx.measureText(word).width <= maxWidth
        ) {
            current = word;
        } else {
            const pieces = splitLongWord(
                ctx,
                word,
                maxWidth
            );

            lines.push(...pieces.slice(0, -1));
            current = pieces[pieces.length - 1];
        }
    }

    if (current) {
        lines.push(current);
    }

    return lines;
}

function wrapText(ctx, text, maxWidth) {
    return text
        .split("\n")
        .flatMap(paragraph => {
            const clean = paragraph.trim();

            if (!clean) return [""];

            return wrapParagraph(
                ctx,
                clean,
                maxWidth
            );
        });
}

function fitText(ctx, text, width, height) {
    for (
        let size = TEXT_STYLE.maxFontSize;
        size >= TEXT_STYLE.minFontSize;
        size--
    ) {
        setFont(ctx, size);

        const lines = wrapText(
            ctx,
            text,
            width
        );

        const lineHeight =
            size * TEXT_STYLE.lineHeight;

        const totalHeight =
            lines.length * lineHeight;

        const widestLine = Math.max(
            ...lines.map(line =>
                ctx.measureText(line).width
            )
        );

        if (
            widestLine <= width &&
            totalHeight <= height
        ) {
            return {
                size,
                lines,
                lineHeight,
                totalHeight
            };
        }
    }

    setFont(ctx, TEXT_STYLE.minFontSize);

    return {
        size: TEXT_STYLE.minFontSize,
        lines: wrapText(
            ctx,
            text,
            width
        ),
        lineHeight:
            TEXT_STYLE.minFontSize *
            TEXT_STYLE.lineHeight,
        totalHeight: 0
    };
}

function drawCenteredText(ctx, text) {
    const padding = {
        top: 16,
        bottom: 16,
        left: 18,
        right: 18
    };

    const width =
        PAPER_AREA.right -
        PAPER_AREA.left -
        padding.left -
        padding.right;

    const height =
        PAPER_AREA.bottom -
        PAPER_AREA.top -
        padding.top -
        padding.bottom;

    const fitted = fitText(
        ctx,
        text,
        width,
        height
    );

    setFont(ctx, fitted.size);

    ctx.save();

    ctx.translate(
        (PAPER_AREA.left + PAPER_AREA.right) / 2,
        (PAPER_AREA.top + PAPER_AREA.bottom) / 2
    );

    // kemiringan mengikuti kertas
    ctx.rotate(-0.025);

    ctx.fillStyle = TEXT_STYLE.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const blockHeight =
        fitted.lines.length *
        fitted.lineHeight;

    let y =
        -blockHeight / 2;

    for (const line of fitted.lines) {
        ctx.fillText(
            line,
            0,
            y
        );

        y += fitted.lineHeight;
    }

    ctx.restore();
}

let fontLoaded = false;

async function bratGojo(text) {
    if (!fontLoaded) {
        const fontBuffer =
            await downloadBuffer(
                BRAT_FONT_URL
            );

        GlobalFonts.register(
            fontBuffer,
            TEXT_STYLE.fontFamily
        );

        fontLoaded = true;
    }

    const imageBuffer =
        await downloadBuffer(
            BRAT_IMAGE_URL
        );

    const image =
        await loadImage(imageBuffer);

    const canvas = createCanvas(
        CANVAS.width,
        CANVAS.height
    );

    const ctx =
        canvas.getContext("2d");

    ctx.drawImage(
        image,
        0,
        0,
        CANVAS.width,
        CANVAS.height
    );

    drawCenteredText(
        ctx,
        normalizeText(text)
    );

    return await canvas.encode("png");
}

router.get("/", async (req, res) => {
    try {
        const { text } = req.query;

        if (!text) {
            return res.status(400).json({
                status: false,
                creator: "ArulzXD",
                message:
                    "Masukkan parameter text"
            });
        }

        const image =
            await bratGojo(text);

        res.setHeader(
            "Content-Type",
            "image/png"
        );

        res.send(image);

    } catch (err) {
        res.status(500).json({
            status: false,
            creator: "ArulzXD",
            message: err.message
        });
    }
});

module.exports = router;