const axios = require('axios');

class MTSExolveAdapter {
    constructor(apiKey, number) {
        this.apiKey = apiKey;
        this.number = number;
        this.baseUrl = 'https://api.exolve.ru/messaging/v1/SendSMS';
    }

    async sendSMS({ destination, text }) {
        const postData = {
            number: this.number,
            destination: destination.replace('+', ''),
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
