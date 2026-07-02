const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Kosong jika login via OAuth (Google/GitHub)
    provider: { type: String, default: 'local' }, // 'local', 'google', atau 'github'
    providerId: { type: String }, // ID unik dari Google/GitHub
    role: { type: String, default: 'free' }, // 'free' atau 'premium'
    apikey: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
