class EventService {
    constructor(apiUrl) {
        this.apiUrl = apiUrl || 'http://localhost:5001/api/v1/appointments/slots'; // URL вашего API;
        this.events = [];
        console.log(this.events);
    }

    async fetchEvents(start, end, doctorId = 1) {
        try {
            start = start.toISOString();
            end = end.toISOString();
            console.log(start, end);
            const response = await fetch(`${this.apiUrl}?startTime=${start}&endTime=${end}`);
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

    addEvent = (eventData) => {
        const newEvent = { ...eventData, id: this.getNextId() };
        this.events.push(newEvent);
        return newEvent;
    };

    updateEvent = (id, updates) => {
        const eventIndex = this.events.findIndex(event => event.id === id);
        if (eventIndex !== -1) {
            this.events[eventIndex] = { ...this.events[eventIndex], ...updates };
            return this.events[eventIndex];
        }
        return null;
    };

    deleteEvent = (id) => {
        this.events = this.events.filter(event => event.id !== id);
    };

    getNextId = () => {
        return this.events.length ? Math.max(...this.events.map(e => e.id)) + 1 : 1;
    };
}

module.exports = EventService;