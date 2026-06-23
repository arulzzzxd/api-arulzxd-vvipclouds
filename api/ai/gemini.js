const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const router = express.Router();

const BASE = "https://gemini.google.com";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Catatan: Masukkan cookie akun Google Anda di sini agar bisa menembus proteksi
const COOKIE_ACCOUNT = "https://gemini.google.com/app?is_sa=1&is_sa=1&android-min-version=301356232&ios-min-version=322.0&campaign_id=bkws&utm_source=sem&utm_medium=paid-media&utm_campaign=bkws&pt=9008&mt=8&ct=p-growth-sem-bkws&gclsrc=aw.ds&gad_source=1&gad_campaignid=20437330464&gbraid=0AAAAApk5BhmCZyXti-ZnB4Yzu4D1G32pw&gclid=CjwKCAjwxITRBhBYEiwA6mZm7ejkLMEJe4yt7E1wi8559q5pI7LebCTc6zWNwrsfC48r01mdKP20_RoCgscQAvD_BwE";

function generateSnim0e() {
    // Sebagai fallback jika tidak melakukan pre-flight request untuk mengambil SNlM0e secara dinamis
    return String(Math.floor(Math.random() * 9000000000000000000) - 4000000000000000000);
}

function parseGeminiResponse(rawText) {
    let answer = "";
    try {
        // Response internal Gemini dibungkus dalam beberapa baris format data text
        const lines = rawText.split("\n");
        for (const line of lines) {
            if (line.includes("wmd.c")) {
                const jsonStr = line.match(/\["wmd\.c",.*/);
                if (jsonStr) {
                    const parsedData = JSON.parse(jsonStr[0]);
                    // Ambil isi struktur array terdalam tempat teks jawaban berada
                    const innerData = JSON.parse(parsedData[1]);
                    answer = innerData[1][0][0][1];
                    break;
                }
            }
        }
    } catch (e) {
        // Jika parser gagal, coba fallback regex sederhana
        const match = rawText.match(/\[\["ws\.resp",.*?,"(.*?)"\]/);
        if (match && match[1]) answer = match[1];
    }
    return answer;
}

async function gemini(prompt) {
    const snim0e = generateSnim0e();
    const bl = "boq_assistant-baking-html-server_20240101.01_p0"; // Build Label dummy/terbaru

    // Struktur payload f.req wajib berupa array stringified
    const reqData = [
        [
            [
                "f.req",
                JSON.stringify([
                    [
                        prompt,
                        0,
                        null,
                        null,
                        null,
                        null,
                        null,
                        []
                    ],
                    ["id-ID"], // Mengatur bahasa response
                    ["", "", ""], // Kebutuhan chat_id / conversation_id bawaan google
                    null,
                    null,
                    null,
                    []
                ])
            ]
        ]
    ];

    const params = new URLSearchParams({
        "bl": bl,
        "_reqid": String(Math.floor(Math.random() * 900000) + 100000),
        "rt": "c"
    });

    const payload = `f.req=${encodeURIComponent(JSON.stringify(reqData))}&at=${snim0e}`;

    const res = await axios.post(
        `${BASE}/_/AssistantFxUi/data/batchexecute?${params.toString()}`,
        payload,
        {
            timeout: 60000,
            headers: {
                "User-Agent": UA,
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                "Cookie": COOKIE_ACCOUNT,
                "Origin": BASE,
                "Referer": `${BASE}/app`,
                "X-Same-Domain": "1"
            }
        }
    );

    const answerText = parseGeminiResponse(res.data);

    if (!answerText) {
        throw new Error("Gagal mengekstrak respon dari Gemini. Pastikan Cookie Anda valid.");
    }

    return {
        success: true,
        model: "gemini-google-web",
        answer: answerText.replace(/\\n/g, "\n") // Rapikan baris baru
    };
}

router.get("/", async (req, res) => {
    try {
        const prompt = req.query.prompt?.trim();

        if (!prompt) {
            return res.status(400).json({
                status: false,
                creator: "ArulzXD",
                message: "Parameter prompt wajib diisi",
                example: "/api/ai/gemini?prompt=siapa penemu lampu pijar"
            });
        }

        const result = await gemini(prompt);

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