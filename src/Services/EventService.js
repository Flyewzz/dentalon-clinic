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
    
    
    async fetchEvents(start, end, doctorId = 1) {
        const { accessToken, refreshToken } = this.getTokens();
        try {
            start = start.toISOString();
            end = end.toISOString();

            const response = await fetch(
                `${this.baseUrl}/appointments/slots?startTime=${start}&endTime=${end}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-Refresh-Token': refreshToken,
                    }
                }
            );
            
            this.login(response);
            const data = await response.json();
            
            return data.map(app => ({
                id: app._id,
                title: app.name, // Имя клиента как заголовок
                start: new Date(app.startTime),
                end: new Date(app.endTime),
                phone: app.phone,
                email: app.email || '',
                isBlocked: false,
            }));
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];  // Возвращаем пустой массив в случае ошибки
        }
    }

    async addSlot(slotData)  {
        const { accessToken, refreshToken } = this.getTokens();
        const response = await fetch(`${this.baseUrl}/appointments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Refresh-Token': refreshToken,
            },
            body: JSON.stringify(slotData)
        });

        this.login(response);
        return await response.json();
    };

    async updateEvent(id, eventData) {
        const { accessToken, refreshToken } = this.getTokens();
        const response = await fetch(`${this.baseUrl}/appointments/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Refresh-Token': refreshToken,
            },
            body: JSON.stringify(eventData)
        });

        this.login(response);
        return await response.json();
    }

    async deleteEvent(id) {
        const { accessToken, refreshToken } = this.getTokens();

        const response = await fetch(`${this.baseUrl}/appointments/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Refresh-Token': refreshToken,
            }
        });

        this.login(response);
        return await response.json();
    }
}

module.exports = EventService;