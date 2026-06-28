const express = require("express");
const axios = require("axios");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const { writeFile, mkdir, readFile } = require("fs/promises");
const { existsSync } = require("fs");
const { join } = require("path");
const moment = require("moment-timezone");

const router = express.Router();

const APPLE_EMOJI_JSON_URL = 'https://media.githubusercontent.com/media/Ditzzx-vibecoder/entahlah/main/emoji-apple.json';
const APPLE_EMOJI_JSON_LOCAL = join(__dirname, 'fonts', 'emoji-apple-image.json');

let appleEmojiMap = null;
const emojiImageCache = new Map();

// --- HELPER FUNCTIONS ---
async function downloadFile(url) {
    const res = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        maxRedirects: 5
    });
    return Buffer.from(res.data);
}

function getTimeStr() {
    return moment().tz("Asia/Jakarta").format("HH.mm");
}

function emojiToUnicode(emoji) {
    return [...emoji].map(c => c.codePointAt(0).toString(16).padStart(4, '0')).join('-');
}

async function loadAppleEmojiMap() {
    if (appleEmojiMap) return appleEmojiMap;
    await mkdir(join(__dirname, 'fonts'), { recursive: true });
    if (!existsSync(APPLE_EMOJI_JSON_LOCAL)) {
        const buf = await downloadFile(APPLE_EMOJI_JSON_URL);
        await writeFile(APPLE_EMOJI_JSON_LOCAL, buf);
    }
    const raw = await readFile(APPLE_EMOJI_JSON_LOCAL, 'utf-8');
    appleEmojiMap = JSON.parse(raw);
    return appleEmojiMap;
}

async function getEmojiImage(emoji) {
    if (!emoji) return null;
    if (emojiImageCache.has(emoji)) return emojiImageCache.get(emoji);
    
    const map = await loadAppleEmojiMap();
    const base = emojiToUnicode(emoji);
    const variants = [
        base,
        base.replace(/-fe0f/gi, ''),
        `${base.replace(/-fe0f/gi, '')}-fe0f`,
        base.toUpperCase(),
        base.replace(/-fe0f/gi, '').toUpperCase(),
        base.replace(/-fe0f/gi, '').toUpperCase() + '-FE0F',
    ];
    
    let b64 = null;
    for (const v of variants) {
        if (map[v]) {
            b64 = map[v];
            break;
        }
    }
    if (!b64) return null;
    
    try {
        const buf = Buffer.from(b64, 'base64');
        const img = await loadImage(buf);
        emojiImageCache.set(emoji, img);
        return img;
    } catch (e) {
        return null;
    }
}

async function drawAppleEmoji(ctx, emoji, x, y, size) {
    if (!emoji) return;
    const img = await getEmojiImage(emoji);
    if (!img) {
        ctx.save();
        ctx.font = `${size}px InterRegular`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(emoji, x, y);
        ctx.restore();
        return;
    }
    ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
}

const EMOJI_REGEX = /(\p{Emoji_Modifier_Base}\p{Emoji_Modifier}|\p{Emoji_Presentation}\uFE0F?|\p{Emoji}\uFE0F|[\u{1F1E0}-\u{1F1FF}]{2}|\p{Extended_Pictographic}\uFE0F?)/gu;

function measureTextCustom(ctx, text, fontSize) {
    ctx.font = `${fontSize}px InterRegular`;
    const parts = text.split(EMOJI_REGEX);
    let totalWidth = 0;
    for (const part of parts) {
        if (!part) continue;
        EMOJI_REGEX.lastIndex = 0;
        if (EMOJI_REGEX.test(part)) {
            totalWidth += fontSize * 1.05;
        } else {
            totalWidth += ctx.measureText(part).width;
        }
        EMOJI_REGEX.lastIndex = 0;
    }
    return totalWidth;
}

async function drawTextWithEmojis(ctx, text, x, y, fontSize) {
    const parts = text.split(EMOJI_REGEX);
    let currentX = x;
    for (const part of parts) {
        if (!part) continue;
        EMOJI_REGEX.lastIndex = 0;
        if (EMOJI_REGEX.test(part)) {
            const emojiSize = fontSize * 1.05;
            const emojiCX = currentX + emojiSize / 2;
            const emojiCY = y;
            await drawAppleEmoji(ctx, part, emojiCX, emojiCY, emojiSize);
            currentX += emojiSize;
        } else {
            ctx.fillText(part, currentX, y);
            currentX += ctx.measureText(part).width;
        }
        EMOJI_REGEX.lastIndex = 0;
    }
}

function wrapText(ctx, text, maxWidth, fontSize) {
    ctx.font = `${fontSize}px InterRegular`;
    const words = text.split(" ");
    const lines = [];
    let cur = "";
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (word.includes('\n')) {
            const parts = word.split('\n');
            for (let j = 0; j < parts.length; j++) {
                const test = cur + (cur ? " " : "") + parts[j];
                if (measureTextCustom(ctx, test, fontSize) > maxWidth && cur) {
                    lines.push(cur);
                    cur = parts[j];
                } else {
                    cur = test;
                }
                if (j < parts.length - 1) {
                    lines.push(cur);
                    cur = "";
                }
            }
            continue;
        }
        const test = cur + (cur ? " " : "") + word;
        if (measureTextCustom(ctx, test, fontSize) > maxWidth && i > 0) {
            lines.push(cur);
            cur = word;
        } else {
            cur = test;
        }
    }
    if (cur) lines.push(cur);
    return lines;
}

// --- MENU ICONS DRAW FUNCTIONS (FROM IQC) ---
const drawStar = (ctx, x, y) => {
    ctx.strokeStyle='#ffffff'; ctx.lineWidth=2.5; ctx.lineJoin='miter';
    ctx.beginPath();
    for (let i=0;i<5;i++) {
        const o=(i*2*Math.PI)/5-Math.PI/2, inn=((i*2+1)*Math.PI)/5-Math.PI/2;
        const ox=x+Math.cos(o)*16, oy=y+Math.sin(o)*16, ix=x+Math.cos(inn)*7, iy=y+Math.sin(inn)*7;
        i===0?ctx.moveTo(ox,oy):ctx.lineTo(ox,oy); ctx.lineTo(ix,iy);
    }
    ctx.closePath(); ctx.stroke();
};
const drawReply = (ctx, x, y) => {
    ctx.strokeStyle='#ffffff'; ctx.lineWidth=2.8; ctx.lineCap='round'; ctx.lineJoin='round';
    const ox=x-3; ctx.beginPath();
    ctx.moveTo(ox,y-6); ctx.lineTo(ox,y-13); ctx.lineTo(ox-13,y); ctx.lineTo(ox,y+13); ctx.lineTo(ox,y+6);
    ctx.bezierCurveTo(ox+9,y+6,ox+16,y+9,ox+20,y+16); ctx.bezierCurveTo(ox+18,y+7,ox+14,y-2,ox,y-6); ctx.stroke();
};
const drawForward = (ctx, x, y) => {
    ctx.strokeStyle='#ffffff'; ctx.lineWidth=2.8; ctx.lineCap='round'; ctx.lineJoin='round';
    const ox=x+3; ctx.beginPath();
    ctx.moveTo(ox,y-6); ctx.lineTo(ox,y-13); ctx.lineTo(ox+13,y); ctx.lineTo(ox,y+13); ctx.lineTo(ox,y+6);
    ctx.bezierCurveTo(ox-9,y+6,ox-16,y+9,ox-20,y+16); ctx.bezierCurveTo(ox-18,y+7,ox-14,y-2,ox,y-6); ctx.stroke();
};
const drawCopy = (ctx, x, y) => {
    ctx.save(); ctx.strokeStyle='#ffffff'; ctx.lineWidth=10; ctx.lineCap='round'; ctx.lineJoin='round';
    const sc=0.23, cx2=-127, cy2=-105; ctx.translate(x,y); ctx.scale(sc,sc);
    ctx.beginPath(); ctx.moveTo(cx2+164,cy2+156); ctx.bezierCurveTo(cx2+164,cy2+164,cx2+158,cy2+170,cx2+150,cy2+170);
    ctx.lineTo(cx2+74,cy2+170); ctx.bezierCurveTo(cx2+66,cy2+170,cx2+60,cy2+164,cx2+60,cy2+156); ctx.lineTo(cx2+60,cy2+80);
    ctx.bezierCurveTo(cx2+60,cy2+72,cx2+66,cy2+66,cx2+74,cy2+66); ctx.stroke(); ctx.beginPath();
    ctx.moveTo(cx2+90,cy2+54); ctx.bezierCurveTo(cx2+90,cy2+46,cx2+96,cy2+40,cx2+104,cy2+40); ctx.lineTo(cx2+180,cy2+40);
    ctx.bezierCurveTo(cx2+188,cy2+40,cx2+194,cy2+46,cx2+194,cy2+54); ctx.lineTo(cx2+194,cy2+130);
    ctx.bezierCurveTo(cx2+194,cy2+138,cx2+188,cy2+144,cx2+180,cy2+144); ctx.lineTo(cx2+104,cy2+144);
    ctx.bezierCurveTo(cx2+96,cy2+144,cx2+90,cy2+138,cx2+90,cy2+130); ctx.closePath(); ctx.stroke(); ctx.restore();
};
const drawComment = (ctx, x, y) => {
    ctx.strokeStyle='#ffffff'; ctx.lineWidth=2.5; ctx.lineCap='round'; ctx.lineJoin='round';
    const w=30,h=22,r=4; ctx.beginPath(); ctx.moveTo(x-w/2+r,y-h/2); ctx.lineTo(x+w/2-r,y-h/2);
    ctx.quadraticCurveTo(x+w/2,y-h/2,x+w/2,y-h/2+r); ctx.lineTo(x+w/2,y+h/2-r);
    ctx.quadraticCurveTo(x+w/2,y+h/2,x+w/2-r,y+h/2); ctx.lineTo(x-w/2+8,y+h/2); ctx.lineTo(x-w/2+3,y+h/2+6);
    ctx.lineTo(x-w/2+4,y+h/2); ctx.lineTo(x-w/2+r,y+h/2); ctx.quadraticCurveTo(x-w/2,y+h/2,x-w/2,y+h/2-r);
    ctx.lineTo(x-w/2,y-h/2+r); ctx.quadraticCurveTo(x-w/2,y-h/2,x-w/2+r,y-h/2); ctx.closePath(); ctx.stroke();
    ctx.fillStyle='#ffffff'; [-6,0,6].forEach(d => { ctx.beginPath(); ctx.arc(x+d,y,2,0,Math.PI*2); ctx.fill(); });
};
const drawReport = (ctx, x, y) => {
    ctx.strokeStyle='#ffffff'; ctx.lineWidth=3.5; ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.beginPath(); ctx.moveTo(x,y-15); ctx.lineTo(x-15,y+12); ctx.lineTo(x+15,y+12); ctx.closePath(); ctx.stroke();
    ctx.fillStyle='#ffffff'; ctx.fillRect(x-1,y-5,2,11); ctx.beginPath(); ctx.arc(x,y+8,1.5,0,Math.PI*2); ctx.fill();
};
const drawTrash = (ctx, x, y) => {
    ctx.strokeStyle='#ff3b30'; ctx.lineWidth=3.5; ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.beginPath(); ctx.moveTo(x-15,y-13); ctx.lineTo(x+15,y-13); ctx.stroke(); ctx.strokeRect(x-8,y-18,16,5);
    ctx.beginPath(); ctx.moveTo(x-12,y-11); ctx.lineTo(x-9,y+13); ctx.lineTo(x+9,y+13); ctx.lineTo(x+12,y-11);
    ctx.closePath(); ctx.stroke(); ctx.lineWidth=2; ctx.beginPath();
    ctx.moveTo(x,y-7); ctx.lineTo(x,y+11); ctx.moveTo(x-7,y-5); ctx.lineTo(x-5,y+11); ctx.moveTo(x+7,y-5); ctx.lineTo(x+5,y+11); ctx.stroke();
};

// --- CORE CANVAS GENERATOR ---
async function renderRinChat({ text = '', imgUrl, emojis } = {}) {
    const timeStr = getTimeStr(); 
    const txt = text;
    const caption = imgUrl ? txt : "";
    
    let emojiList = ["😈", "🥶", "😹", "🤍", "☠️", "👺"];
    if (Array.isArray(emojis) && emojis.length > 0) {
        emojiList = emojis.filter(e => e.trim() !== "");
    }

    const RIN_BG_URL = 'https://raw.githubusercontent.com/ryyntwx/allimagerin/refs/heads/main/iqc-hytam.png';
    const RIN_DIR = join(process.cwd(), 'assets', 'rinchat');
    const RIN_BG_LOCAL = join(RIN_DIR, 'iqc-hytam.png');
    const RIN_FONTS_DIR = join(RIN_DIR, 'fonts');

    const RIN_FONTS = [{
        url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
        file: 'Inter-Regular.ttf'
    }];

    const BG_W = 941;
    const BG_H = 1671;

    await mkdir(RIN_FONTS_DIR, { recursive: true });

    async function rinDownload(url) {
        const res = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' },
            maxRedirects: 5
        });
        return Buffer.from(res.data);
    }

    for (const f of RIN_FONTS) {
        const dest = join(RIN_FONTS_DIR, f.file);
        if (!existsSync(dest)) await writeFile(dest, await rinDownload(f.url));
        GlobalFonts.registerFromPath(dest, 'InterRegular');
    }

    if (!existsSync(RIN_BG_LOCAL)) {
        await writeFile(RIN_BG_LOCAL, await rinDownload(RIN_BG_URL));
    }

    await loadAppleEmojiMap();

    const canvas = createCanvas(BG_W, BG_H);
    const ctx = canvas.getContext('2d');
    const bgImg = await loadImage(RIN_BG_LOCAL);
    ctx.drawImage(bgImg, 0, 0, BG_W, BG_H);

    // Waktu Atas Layar Utama
    const PERMANENT_TIME_X = 463;
    const PERMANENT_TIME_Y = 8;
    const PERMANENT_TIME_SIZE = 27;

    ctx.fillStyle = "#ffffff";
    ctx.font = `${PERMANENT_TIME_SIZE}px InterRegular`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(timeStr, PERMANENT_TIME_X, PERMANENT_TIME_Y);

    const chatFontSize = 30;
    const maxWidthLimit = 530;
    const minBubbleWidth = 280;
    const lineHeight = chatFontSize + 14;
    const paddingX = 30;
    const paddingY = 20;
    const rad = 28;
    const fixedX = 35;
    
    // Titik tumpu penempatan Menu Iqc berada di bawah
    const menuX = 35;
    const menuW = 680; 
    const menuH = 560;
    const menuY = BG_H - menuH - 70; // 1041

    ctx.font = `22px InterRegular`;
    const timeWidth = ctx.measureText(timeStr).width;

    let finalY, finalBubbleHeight, bubbleW;

    if (!imgUrl) {
        ctx.font = `${chatFontSize}px InterRegular`;
        const chatLines = wrapText(ctx, txt, maxWidthLimit, chatFontSize);

        let longestW = 0;
        chatLines.forEach(l => {
            const w = measureTextCustom(ctx, l.trim(), chatFontSize);
            if (w > longestW) longestW = w;
        });

        bubbleW = longestW + (paddingX * 2);
        bubbleW = Math.max(bubbleW, timeWidth + 75);
        bubbleW = Math.max(bubbleW, 180);

        const spaceTimeY = 12;
        finalBubbleHeight = (chatLines.length * lineHeight) + paddingY + spaceTimeY + 22;
        finalY = menuY - finalBubbleHeight - 35; // Bubble berjarak di atas Menu

        ctx.fillStyle = "#1c1c1e";
        ctx.beginPath();
        ctx.moveTo(fixedX + rad, finalY);
        ctx.lineTo(fixedX + bubbleW - rad, finalY);
        ctx.quadraticCurveTo(fixedX + bubbleW, finalY, fixedX + bubbleW, finalY + rad);
        ctx.lineTo(fixedX + bubbleW, finalY + finalBubbleHeight - rad);
        ctx.quadraticCurveTo(fixedX + bubbleW, finalY + finalBubbleHeight, fixedX + bubbleW - rad, finalY + finalBubbleHeight);
        ctx.lineTo(fixedX + rad, finalY + finalBubbleHeight);
        ctx.quadraticCurveTo(fixedX + 8, finalY + finalBubbleHeight, fixedX + 8, finalY + finalBubbleHeight - 8);
        ctx.lineTo(fixedX + 8, finalY + rad);
        ctx.quadraticCurveTo(fixedX + 8, finalY, fixedX + rad, finalY);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(fixedX + 12, finalY + finalBubbleHeight - 20);
        ctx.quadraticCurveTo(fixedX - 2, finalY + finalBubbleHeight - 4, fixedX - 8, finalY + finalBubbleHeight);
        ctx.quadraticCurveTo(fixedX + 6, finalY + finalBubbleHeight, fixedX + 22, finalY + finalBubbleHeight - 2);
        ctx.closePath();
        ctx.fill();

        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.font = `${chatFontSize}px InterRegular`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        for (let i = 0; i < chatLines.length; i++) {
            const lineY = finalY + paddingY + (i * lineHeight) + (chatFontSize / 2);
            await drawTextWithEmojis(ctx, chatLines[i].trim(), fixedX + paddingX, lineY, chatFontSize);
        }
        ctx.restore();

        ctx.fillStyle = "#727278";
        ctx.font = `22px InterRegular`;
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.fillText(timeStr, fixedX + bubbleW - 22, finalY + finalBubbleHeight - 38);

    } else {
        const imgBuf = imgUrl.startsWith('http') ? await rinDownload(imgUrl) : await readFile(imgUrl);
        const imgObj = await loadImage(imgBuf);

        const imgAspect = imgObj.width / imgObj.height;
        bubbleW = Math.min(Math.max(imgObj.width, minBubbleWidth), maxWidthLimit);
        let imgDrawH = Math.round(bubbleW / imgAspect);
        bubbleW = Math.max(bubbleW, timeWidth + 75);

        let captionLines = [];
        if (caption) {
            ctx.font = `${chatFontSize}px InterRegular`;
            captionLines = wrapText(ctx, caption, bubbleW - (paddingX * 2), chatFontSize);
        }

        const captionH = captionLines.length > 0 ? paddingY + (captionLines.length * lineHeight) : 0;
        const timeRowH = 28;
        finalBubbleHeight = imgDrawH + captionH + timeRowH + (captionLines.length > 0 ? 4 : 0);
        finalY = menuY - finalBubbleHeight - 35;

        ctx.fillStyle = "#1c1c1e";
        ctx.beginPath();
        ctx.moveTo(fixedX + rad, finalY);
        ctx.lineTo(fixedX + bubbleW - rad, finalY);
        ctx.quadraticCurveTo(fixedX + bubbleW, finalY, fixedX + bubbleW, finalY + rad);
        ctx.lineTo(fixedX + bubbleW, finalY + finalBubbleHeight - rad);
        ctx.quadraticCurveTo(fixedX + bubbleW, finalY + finalBubbleHeight, fixedX + bubbleW - rad, finalY + finalBubbleHeight);
        ctx.lineTo(fixedX + rad, finalY + finalBubbleHeight);
        ctx.quadraticCurveTo(fixedX + 8, finalY + finalBubbleHeight, fixedX + 8, finalY + finalBubbleHeight - 8);
        ctx.lineTo(fixedX + 8, finalY + rad);
        ctx.quadraticCurveTo(fixedX + 8, finalY, fixedX + rad, finalY);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(fixedX + 12, finalY + finalBubbleHeight - 20);
        ctx.quadraticCurveTo(fixedX - 2, finalY + finalBubbleHeight - 4, fixedX - 8, finalY + finalBubbleHeight);
        ctx.quadraticCurveTo(fixedX + 6, finalY + finalBubbleHeight, fixedX + 22, finalY + finalBubbleHeight - 2);
        ctx.closePath();
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(fixedX + rad, finalY);
        ctx.lineTo(fixedX + bubbleW - rad, finalY);
        ctx.quadraticCurveTo(fixedX + bubbleW, finalY, fixedX + bubbleW, finalY + rad);
        ctx.lineTo(fixedX + bubbleW, finalY + imgDrawH);
        ctx.lineTo(fixedX + 8, finalY + imgDrawH);
        ctx.lineTo(fixedX + 8, finalY + rad);
        ctx.quadraticCurveTo(fixedX + 8, finalY, fixedX + rad, finalY);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(imgObj, fixedX, finalY, bubbleW, imgDrawH);
        ctx.beginPath();
        ctx.moveTo(fixedX + 8, finalY + imgDrawH);
        ctx.lineTo(fixedX + 8, finalY + rad);
        ctx.quadraticCurveTo(fixedX + 8, finalY, fixedX + rad, finalY);
        ctx.lineTo(fixedX + bubbleW - rad, finalY);
        ctx.quadraticCurveTo(fixedX + bubbleW, finalY, fixedX + bubbleW, finalY + rad);
        ctx.lineTo(fixedX + bubbleW, finalY + imgDrawH);
        ctx.strokeStyle = "#1c1c1e";
        ctx.lineWidth = 18;
        ctx.stroke();
        ctx.restore();

        if (captionLines.length > 0) {
            ctx.save();
            ctx.fillStyle = "#ffffff";
            ctx.font = `${chatFontSize}px InterRegular`;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            for (let i = 0; i < captionLines.length; i++) {
                const lineY = finalY + imgDrawH + paddingY + (i * lineHeight) + (chatFontSize / 2);
                await drawTextWithEmojis(ctx, captionLines[i].trim(), fixedX + paddingX, lineY, chatFontSize);
            }
            ctx.restore();
        }

        ctx.fillStyle = "#727278";
        ctx.font = `22px InterRegular`;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(timeStr, fixedX + bubbleW - 22, finalY + finalBubbleHeight - timeRowH);
    }

    // --- DRAW REACTION CARD (Diatas Bubble Chat) ---
    const emojiSize = Math.round(54 * 1.03);
    const emCardH = emojiSize + Math.round(44 * 1.03);
    const emCardW = Math.round(530 * 1.03);
    const emCardX = fixedX + 8;
    const emCardY = finalY - emCardH - 18;

    ctx.fillStyle = "#1c1c1e";
    ctx.beginPath();
    ctx.roundRect(emCardX, emCardY, emCardW, emCardH, [emCardH / 2]);
    ctx.fill();

    const startX = emCardX + 55;
    const spacingX = 76;
    const emojiCY = emCardY + (emCardH / 2) + 2;

    for (let i = 0; i < Math.min(emojiList.length, 6); i++) {
        if (emojiList[i]) {
            await drawAppleEmoji(ctx, emojiList[i], startX + (i * spacingX), emojiCY, emojiSize);
        }
    }

    ctx.fillStyle = "#8e8e93";
    ctx.font = `${Math.round(36 * 1.03)}px InterRegular`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("+", startX + (6 * spacingX) - 8, emCardY + (emCardH / 2) - 2);


    // --- DRAW ACTION MENU CONTAINER (Gaya IQC Asli) ---
    const mR = 24;
    ctx.fillStyle = '#1c1c1e'; // Mengikuti tema gelap iqcv2
    ctx.beginPath();
    ctx.moveTo(menuX + mR, menuY); ctx.lineTo(menuX + menuW - mR, menuY);
    ctx.quadraticCurveTo(menuX + menuW, menuY, menuX + menuW, menuY + mR);
    ctx.lineTo(menuX + menuW, menuY + menuH - mR);
    ctx.quadraticCurveTo(menuX + menuW, menuY + menuH, menuX + menuW - mR, menuY + menuH);
    ctx.lineTo(menuX + mR, menuY + menuH);
    ctx.quadraticCurveTo(menuX, menuY + menuH, menuX, menuY + menuH - mR);
    ctx.lineTo(menuX, menuY + mR);
    ctx.quadraticCurveTo(menuX, menuY, menuX + mR, menuY);
    ctx.closePath(); ctx.fill();

    const items = [
        { text:'Beri Bintang', icon:drawStar },
        { text:'Balas',        icon:drawReply },
        { text:'Teruskan',     icon:drawForward },
        { text:'Salin',        icon:drawCopy },
        { text:'Ucapkan',      icon:drawComment },
        { text:'Laporkan',     icon:drawReport },
        { text:'Hapus',        icon:drawTrash, color:'#ff3b30' },
    ];

    ctx.textAlign = 'left';
    items.forEach((item, i) => {
        const iy = menuY + i * 80;
        ctx.fillStyle = item.color || '#ffffff';
        ctx.font = '30px InterRegular';
        ctx.fillText(item.text, menuX + 40, iy + 50);
        item.icon(ctx, menuX + menuW - 40, iy + 40);
        if (i < items.length - 1) {
            ctx.strokeStyle='#2c2c2e'; ctx.lineWidth=1.5;
            ctx.beginPath(); ctx.moveTo(menuX+35,iy+80); ctx.lineTo(menuX+menuW-35,iy+80); ctx.stroke();
        }
    });

    return await canvas.encode('png');
}

// --- EXPRESS ROUTE ENDPOINT ---
router.get('/', async (req, res) => {
    try {
        const text = req.query.text || '';
        const imgUrl = req.query.imgUrl || null;
        let emojis = req.query.emojis; 

        if (!text && !imgUrl) {
            return res.status(400).json({
                status: false,
                creator: "ArulzXD",
                message: "Parameter 'text' atau 'imgUrl' diperlukan."
            });
        }

        let parsedEmojis = [];
        if (emojis) {
            parsedEmojis = emojis.split(',').map(e => e.trim()).filter(Boolean);
        }

        const imageBuffer = await renderRinChat({
            text,
            imgUrl,
            emojis: parsedEmojis
        });

        res.setHeader('Content-Type', 'image/png');
        return res.send(imageBuffer);

    } catch (err) {
        return res.status(500).json({
            status: false,
            creator: "ArulzXD",
            message: err.message || err
        });
    }
});

router.status = "ready";
router.type = "free";
module.exports = router;
