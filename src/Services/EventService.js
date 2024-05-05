class EventService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl; // URL вашего API;
        this.events = [];
    }

    getToken() {
        return localStorage.getItem('accessToken');  // Получаем токен из localStorage
    }
    
    async fetchEvents(start, end, doctorId = 1) {
        const token = this.getToken();
        try {
            start = start.toISOString();
            end = end.toISOString();
            console.log(start, end);
            const response = await fetch(
                `${this.baseUrl}/appointments/slots?startTime=${start}&endTime=${end}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
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
        const token = this.getToken();
        const response = await fetch(`${this.baseUrl}/appointments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(slotData)
        });
        
        return await response.json();
    };

    async updateEvent(id, eventData) {
        const token = this.getToken();
        const response = await fetch(`${this.baseUrl}/appointments/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(eventData)
        });
        
        return await response.json();
    }

    async deleteEvent(id) {
        const token = this.getToken();
        const response = await fetch(`${this.baseUrl}/appointments/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        
        return await response.json();
    }
}

module.exports = EventService;