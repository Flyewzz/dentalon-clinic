const Block = require('../../domain/model/BlockAppointment');

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
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
            doctorId,
        });
    }
}

module.exports = BlockService;