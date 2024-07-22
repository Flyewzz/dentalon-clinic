const axios = require('axios');

class MTSExolveAdapter {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.exolve.ru/messaging/v1/SendSMS';
    }

    async sendSMS({ number, destination, text }) {
        const postData = {
            number,
            destination,
            text,
        };
        
        const response = await axios.post(this.baseUrl, postData, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`
            }
        });
        if (response.status !== 200) {
            // Ошибки, полученные от сервера
            throw new Error(`Ошибка при отправке SMS на номер ${destination}: ${error.response.status} - ${error.response.data}`);
        }
        
        return response.data;
    }
}

module.exports = MTSExolveAdapter;
