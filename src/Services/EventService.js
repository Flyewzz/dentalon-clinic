class EventService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl; // URL вашего API;
        this.events = [];
    }

    async fetchEvents(start, end, doctorId = 1) {
        try {
            start = start.toISOString();
            end = end.toISOString();
            console.log(start, end);
            const response = await fetch(
                `${this.baseUrl}/appointments/slots?startTime=${start}&endTime=${end}`
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
        const response = await fetch(`${this.baseUrl}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(slotData)
        });
        
        return await response.json();
    };

    async updateEvent(id, eventData) {
        const response = await fetch(`${this.baseUrl}/appointments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });
        
        return await response.json();
    }

    async deleteEvent(id) {
        const response = await fetch(`${this.baseUrl}/appointments/${id}`, {
            method: 'DELETE'
        });
        
        return await response.json();
    }
}

module.exports = EventService;