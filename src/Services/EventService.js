class EventService {
    constructor() {
        this.events = [
            // начальный набор событий
            {
                id: 0,
                title: 'Петрасовна',
                start: new Date(2024, 3, 29, 10, 0),
                end: new Date(2024, 3, 29, 11, 0),
                isBlocked: false
            }
        ];
    }

    fetchEvents = () => {
        // Здесь будет логика получения событий через API
        return this.events;
    };

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