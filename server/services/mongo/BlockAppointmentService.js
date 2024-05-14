const Block = require('../../domain/model/BlockAppointment');
const {Error} = require("mongoose");
const {ValidationError, DatabaseError, NotFoundError} = require("../../errors/Error");

class BlockService {
    async findOverlappedBlocks(startTime, endTime, doctorId = 1) {
        try {
            return await Block.find({
                startTime: {$lt: new Date(endTime)},
                endTime: {$gt: new Date(startTime)},
                doctorId: doctorId,
            });
        } catch (error) {
            this.handleError(error);
        }
    }
    
    async createBlock(blockData) {
        const block = new Block(blockData);
        return await block.save();
    }

    async updateBlock(id, updateData) {
        try {
            const block = await Block.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
            if (!block) {
                throw new NotFoundError(`Block ${id} not found`);
            }

            return block;
        } catch (error) {
            this.handleError(error);
        }
    }
    
    async deleteBlock(blockId) {
        return await Block.findByIdAndDelete(blockId);
    }
    
    static async checkOverlap({ doctorId, startTime, endTime }) {
        return await Block.findOne({
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
            doctorId,
        });
    }

    handleError(error) {
        if (error instanceof Error.ValidationError) {
            throw new ValidationError(error.message);
        } else if (error instanceof Error.CastError) {
            throw new ValidationError('Invalid data format');
        } else {
            throw new DatabaseError('Database error occurred');
        }
    }
}

module.exports = BlockService;