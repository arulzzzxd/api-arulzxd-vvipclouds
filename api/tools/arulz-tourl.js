const express = require("express");
const Busboy = require("busboy");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();

router.post("/", (req, res) => {
    const busboy = Busboy({ headers: req.headers });

    let chunks = [];
    let filename = "file";
    let mimetype = "application/octet-stream";

    busboy.on("file", (name, file, info) => {
        filename = info.filename;
        mimetype = info.mimeType;

        file.on("data", data => chunks.push(data));
    });

    busboy.on("finish", async () => {
        try {
            const buffer = Buffer.concat(chunks);

            const form = new FormData();
            form.append("file", buffer, {
                filename,
                contentType: mimetype
            });

            const { data } = await axios.post(
                "https://arulz-uploader.vercel.app/api/upload",
                form,
                {
                    headers: form.getHeaders()
                }
            );

            res.json({
                status: true,
                creator: "ArulzXD",
                result: data
            });
        } catch (e) {
            res.status(500).json({
                status: false,
                message: e.message
            });
        }
    });

    req.pipe(busboy);
});

module.exports = router;
