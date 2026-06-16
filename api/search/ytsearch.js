import express from "express";
import yts from "yt-search";

const router = express.Router();

// Fungsi untuk mengacak array agar hasil video bervariasi
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

router.get("/", async (req, res) => {
    try {
        const query = req.query.query?.trim();

        if (!query) {
            return res.status(400).json({
                status: false,
                creator: "Arulzxd",
                message: "Parameter ?query= wajib diisi",
                example: "/youtube?query=alan walker"
            });
        }

        // Menggunakan yts({ query }) atau yts.search({ query }) untuk mengambil hasil maksimal
        const search = await yts(query);

        if (!search.videos || search.videos.length === 0) {
            return res.status(404).json({
                status: false,
                creator: "Arulzxd",
                message: "Video tidak ditemukan"
            });
        }

        // 1. Acak seluruh video yang berhasil didapatkan (bisa 30, 40, atau 100 video tergantung query)
        const shuffledVideos = shuffleArray([...search.videos]);

        // 2. Potong menjadi 50 video (jika hasil pencarian kurang dari 50, dia akan mengambil maksimal yang ada)
        const videos = shuffledVideos.slice(0, 50).map(video => ({
            title: video.title,
            videoId: video.videoId,
            duration: video.timestamp,
            views: video.views,
            uploaded: video.ago,
            url: video.url,
            thumbnail: video.thumbnail,
            author: video.author?.name || "Unknown"
        }));

        return res.status(200).json({
            status: true,
            creator: "Arulzxd",
            result: {
                query,
                total: videos.length, // Akan menampilkan jumlah riil yang didapat (maksimal 50)
                videos
            },
            metadata: {
                source: "yt-search",
                timestamp: new Date().toISOString()
            }
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            status: false,
            creator: "Arulzxd",
            message: "Terjadi kesalahan saat mencari video",
            error: err.message
        });
    }
});

export default router;