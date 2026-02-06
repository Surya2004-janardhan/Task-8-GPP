const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    userId: { type: String, required: true, index: true },
    eventType: { type: String, required: true },
    timestamp: { type: Date, required: true },
    processedAt: { type: Date, default: Date.now },
    payload: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
