const axios = require('axios');

const BASE_URL = 'https://clck.ru/--';
const querystring = require('querystring');
const Bottleneck = require("bottleneck");

const limiter = new Bottleneck({
    minTime: 1000, // Минимум 1 секунда между запросами
    reservoir: 3600, // 3600 запросов в час
    reservoirRefreshAmount: 3600,
    reservoirRefreshInterval: 60 * 60 * 1000 // Обновление лимита каждый час
});

class LinkShortener {
    static async getShortLink(url) {
        url = url.replace('localhost:3000', 'dentalon41.ru');
        const postData = querystring.stringify({ url });
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        try {
            const response = await limiter.schedule(() => axios.post(BASE_URL, postData, config));
            // const response = await limiter.schedule(() => {return {status: 200, data: url}});
            if (response.status !== 200) {
                throw new Error(`Ошибка при сокращении ссылки ${url}: ${response.status} - ${response.data}`);
            }
            return response.data;
        } catch (error) {
            throw new Error(`Ошибка при сокращении ссылки ${url}: ${error.response.status} - ${error.response.data}`);
        }
    }
}

module.exports = LinkShortener;
