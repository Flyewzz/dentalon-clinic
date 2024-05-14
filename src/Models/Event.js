class Event {
    constructor(id, title, startTime, endTime) {
        this.id = id;
        this.title = title;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}

class Slot extends Event {
    constructor(id, title, startTime, endTime, phone, email, type) {
        super(id, title, startTime, endTime);
        this.phone = phone;
        this.email = email;
        this.isBlocked = false;
        this.type = type;
    }
    
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            start: this.startTime,
            end: this.endTime,
            phone: this.phone,
            email: this.email,
            type: this.type,
            isBlocked: false,
        }
    }
}

class Block extends Event {
    constructor(id, title, startTime, endTime) {
        super(id, title, startTime, endTime);
        this.isBlocked = true;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            start: this.startTime,
            end: this.endTime,
            isBlocked: true,
        }
    }
}

module.exports = { Event, Slot, Block };