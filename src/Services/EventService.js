import EventFactory from "./EventFactory";

class EventService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl; // URL вашего API;
        this.events = [];
    }
    
    login(res) {
        const accessToken = res.headers.get('X-Access-Token');
        const refreshToken = res.headers.get('X-Refresh-Token');
        
        if (accessToken && refreshToken) {
            localStorage.setItem('X-Access-Token', accessToken);
            localStorage.setItem('X-Refresh-Token', refreshToken);
        }
    }

    getTokens() {
        return {
            accessToken: localStorage.getItem('accessToken'),
            refreshToken: localStorage.getItem('refreshToken')
        };
    }

    async authenticatedRequest(url, options = {}) {
        const tokens = this.getTokens();
        const headers = new Headers(options.headers || {});
        headers.append('Authorization', `Bearer ${tokens.accessToken}`);
        headers.append('Content-Type', 'application/json');
        headers.append('X-Refresh-Token', tokens.refreshToken);

        const response = await fetch(url, { ...options, headers });
        this.login(response); // Обновить токены если нужно
        return response;
    }
    
    async fetchEvents(start, end, doctorId = 1) {
        try {
            start = start.toISOString();
            end = end.toISOString();

            const response = await this.authenticatedRequest(
                `${this.baseUrl}/appointments/slots?startTime=${start}&endTime=${end}`
            );
            
            const data = await response.json();
            return data.map(item => EventFactory.createSlot(item));
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];  // Возвращаем пустой массив в случае ошибки
        }
    }

    async fetchBlocks(start, end) {
        const response = this.authenticatedRequest(`${this.apiUrl}/api/v1/blocks?startTime=${start.toISOString()}&endTime=${end.toISOString()}`);
        const data = await response.json();
        return data.map(blockData => EventFactory.createBlock(blockData));
    }

    async addSlot(slotData)  {
        const response = await this.authenticatedRequest(`${this.baseUrl}/appointments`, {
            method: 'POST',
            body: JSON.stringify(slotData)
        });

        return await response.json();
    };

    async updateEvent(id, eventData) {
        const response = await this.authenticatedRequest(`${this.baseUrl}/appointments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(eventData)
        });

        this.login(response);
        return await response.json();
    }

    async deleteEvent(id) {
        const response = await this.authenticatedRequest(`${this.baseUrl}/appointments/${id}`, {
            method: 'DELETE',
        });

        this.login(response);
        return await response.json();
    }
}

export default EventService;