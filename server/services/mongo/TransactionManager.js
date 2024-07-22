const mongoose = require("mongoose");

class TransactionManager {
    async startSession() {
        // Using Mongoose's default connection
        return await mongoose.startSession();
    }
}

module.exports = TransactionManager;
