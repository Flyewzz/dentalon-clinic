const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20,
    },
    email: {
        type: String,
        required: true,
        maxlength: 50,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 12,
    },
    role: {
        type: String,
        enum: ['patient', 'doctor'],
        required: true
    },
    doctorId: {type: Number},
});

module.exports = mongoose.model("User", userSchema);
