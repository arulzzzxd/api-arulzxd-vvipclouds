const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/", async (req, res) => {
    const search = req.query.search;

    // Validasi input parameter wajib
    if (!search) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'search' wajib diisi!"
        });
    }

    // MEMBUAT PAGE OTOMATIS RANDOM (Antara halaman 1 sampai 10)
    const randomPage = Math.floor(Math.random() * 10) + 1; 
    const count = 20;
    const cursor = (randomPage - 1) * count; // Menghasilkan cursor acak: 0, 20, 40, ... s/d 180

    try {
        // Melakukan POST request ke TikWM
        const response = await axios.post(
            "https://www.tikwm.com/api/feed/search",
            new URLSearchParams({
                keywords: search,
                count: count,
                cursor: cursor
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            }
        );

        const result = response.data;

        // Cek jika data berhasil diambil
        if (result.code === 0 && result.data && result.data.videos) {
            const videos = result.data.videos;

            // Memetakan data hasil scraping
            const formattedData = videos.map(video => ({
                id: video.video_id,
                title: video.title,
                duration: video.duration,
                play_count: video.play_count,
                digg_count: video.digg_count, 
                comment_count: video.comment_count,
                share_count: video.share_count,
                download_urls: {
                    no_watermark: `https://www.tikwm.com${video.play}`,
                    watermark: `https://www.tikwm.com${video.wmplay}`,
                    music: `https://www.tikwm.com${video.music}`
                },
                author: {
                    id: video.author.id,
                    unique_id: video.author.unique_id,
                    nickname: video.author.nickname,
                    avatar: `https://www.tikwm.com${video.author.avatar}`
                }
            }));

            // Mengirimkan respons sukses JSON ke client
            return res.json({
                status: true,
                creator: "Scraper API",
                auto_page: randomPage, // Memberitahu client halaman acak berapa yang didapat
                total_results: formattedData.length,
                data: formattedData
            });

        } else {
            return res.status(404).json({
                status: false,
                message: result.msg || "Video tidak ditemukan atau pencarian mencapai batas."
            });
        }

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan pada server internal.",
            error: error.message
        });
    }
});

router.status = "ready"; 
router.type = "free";
module.exports = router;