const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const kota = req.query.kota;
        const lang = req.query.lang || "id";

        if (!kota) {
            return res.status(400).json({
                status: false,
                creator: "ArulzXD",
                message: "Parameter 'kota' diperlukan.",
                example: "/api/search/cuaca?kota=Jakarta&lang=id"
            });
        }

        const geo = await axios.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            {
                params: {
                    name: kota,
                    count: 1,
                    language: lang,
                    format: "json"
                }
            }
        );

        if (!geo.data.results || !geo.data.results.length) {
            return res.status(404).json({
                status: false,
                creator: "ArulzXD",
                message: "Kota tidak ditemukan."
            });
        }

        const city = geo.data.results[0];

        const weather = await axios.get(
            "https://api.open-meteo.com/v1/forecast",
            {
                params: {
                    latitude: city.latitude,
                    longitude: city.longitude,
                    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m",
                    timezone: "auto"
                }
            }
        );

        res.json({
            status: true,
            creator: "ArulzXD",
            result: {
                kota: city.name,
                negara: city.country,
                provinsi: city.admin1 || "",
                latitude: city.latitude,
                longitude: city.longitude,
                timezone: weather.data.timezone,
                cuaca: weather.data.current
            }
        });

    } catch (err) {
        res.status(500).json({
            status: false,
            creator: "ArulzXD",
            message: err.message
        });
    }
});

router.paramsConfig = {
    lang: {
        type: "select",
        options: [
            "aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az", 
            "ba", "be", "bg", "bh", "bi", "bm", "bn", "bo", "br", "bs", "ca", "ce", 
            "ch", "co", "cr", "cs", "cu", "cv", "cy", "da", "de", "dv", "dz", "ee", 
            "el", "en", "eo", "es", "et", "eu", "fa", "ff", "fi", "fj", "fo", "fr", 
            "fy", "ga", "gd", "gl", "gn", "gu", "gv", "ha", "he", "hi", "ho", "hr", 
            "ht", "hu", "hy", "hz", "ia", "id", "ie", "ig", "ii", "ik", "io", "is", 
            "it", "iu", "ja", "jv", "ka", "kg", "ki", "kj", "kk", "kl", "km", "kn", 
            "ko", "kr", "ks", "ku", "kv", "kw", "ky", "la", "lb", "lg", "li", "ln", 
            "lo", "lt", "lu", "lv", "mg", "mh", "mi", "mk", "ml", "mn", "mr", "ms", 
            "mt", "my", "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv", 
            "ny", "oc", "oj", "om", "or", "os", "pa", "pi", "pl", "ps", "pt", "qu", 
            "rm", "rn", "ro", "ru", "rw", "sa", "sc", "sd", "se", "sg", "si", "sk", 
            "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw", "ta", 
            "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", 
            "ty", "ug", "uk", "ur", "uz", "ve", "vi", "vo", "wa", "wo", "xh", "yi", 
            "yo", "za", "zh", "zu"
        ]
    }
};

router.status = "ready";
router.type = "free";
module.exports = router;