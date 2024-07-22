import {Block, Slot} from "../Models/Event";

class EventFactory {
    static createSlot(data) {
        return new Slot(
            data._id,
            data.name,
            new Date(data.startTime),
            new Date(data.endTime),
            data.phone,
            data.address || '',
            data.type,
            data.questions,
        );
    }

    static createBlock(data) {
        return new Block(
            data._id,
            data.title,
            new Date(data.startTime),
            new Date(data.endTime)
        );
    }
}

export default EventFactory;