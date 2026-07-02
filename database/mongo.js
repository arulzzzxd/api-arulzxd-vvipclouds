const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Ganti dengan URI MongoDB Anda (Gunakan Env Variable di Vercel/VPS)
        const mongoURI = process.env.MONGO_URI || "mongodb://api-arulzxd-vvipclouds.vercel.app/";
        await mongoose.connect(mongoURI);
        console.log("MongoDB Terkoneksi dengan Sukses! ✅");
    } catch (err) {
        console.error("Gagal Koneksi MongoDB:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
