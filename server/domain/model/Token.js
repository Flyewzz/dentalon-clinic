const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    token: String,
    expires: Date,
    createdByIp: String,
    revoked: Date,
    revokedByIp: String,
    replacedByToken: String
});

const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;
