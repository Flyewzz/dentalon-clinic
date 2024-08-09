const config = require('./config');
const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;
ObjectId.prototype.valueOf = function () {
    return this.toString();
};

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return; // уже подключено
    }
    try {
        await mongoose.connect(config.dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('DB Connection Successfully');
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
