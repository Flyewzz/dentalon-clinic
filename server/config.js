const path = require('path');
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

require('dotenv').config({ path: path.resolve(__dirname, envFile) });

// Optionally export any specific environment variables you want to use
module.exports = {
    dbUri: process.env.MONGO_URL,
    port: process.env.PORT,
    notificationsEnabled: process.env.NOTIFICATIONS_ENABLED,
};
