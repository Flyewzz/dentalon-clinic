const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;
ObjectId.prototype.valueOf = function () {
    return this.toString();
};

require('dotenv').config();

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return; // уже подключено
    }
    try {
        await mongoose.connect(process.env.MONGO_URL, {
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
