const mongoose = require('mongoose');

// Схема для инкрементации идентификатора
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    currentNumber: { type: Number, default: 0 }
});

const ContractCounter = mongoose.model('ContractCounter', counterSchema);
module.exports = ContractCounter;
