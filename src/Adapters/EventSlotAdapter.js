class EventSlotAdapter {
    slotsToEvents(slots) {
        return slots.map(slot => ({
            id: slot._id,
            title: slot.name, // Имя клиента как заголовок
            start: new Date(slot.startTime),
            end: new Date(slot.endTime),
            phone: slot.phone,
            address: slot.address || '',
            type: slot.type,
            isBlocked: false,
        }));
    }

    eventToSlot(event) {
        return {
            _id: event.id,
            name: event.title,
            startTime: event.start.toISOString(),
            endTime: event.end.toISOString(),
            phone: event.phone,
            address: event.address || '',
            type: event.type,
            isBlocked: event.isBlocked,
        }
    }
}

export default EventSlotAdapter;