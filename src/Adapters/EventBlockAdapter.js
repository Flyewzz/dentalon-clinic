class EventBlockAdapter {
    blocksToEvents(blocks) {
        return blocks.map(block => ({
            id: block._id,
            title: block.title,
            start: new Date(block.startTime),
            end: new Date(block.endTime),
            isBlocked: true,
        }));
    }

    eventToBlock(event) {
        return {
            id: event.id,
            title: event.title,
            startTime: event.start.toISOString(),
            endTime: event.end.toISOString(),
        }
    }
}

export default EventBlockAdapter;