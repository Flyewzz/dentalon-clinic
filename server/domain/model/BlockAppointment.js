const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
    doctorId: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    title: { type: String, required: true },  // Причина блокировки
});

const Block = mongoose.model('Block', blockSchema);
module.exports = Block;
