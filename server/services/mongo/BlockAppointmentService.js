const Block = require('../models/Block');
const Appointment = require("../../domain/model/Appointment");

class BlockService {
    static async createBlock(blockData) {
        const block = new Block(blockData);
        return await block.save();
    }

    static async deleteBlock(blockId) {
        return await Block.findByIdAndDelete(blockId);
    }

    static async checkOverlap({ doctorId, startTime, endTime }) {
        return await Block.findOne({
            doctorId,
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
        });
    }
}
