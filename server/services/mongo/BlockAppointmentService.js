const Block = require('../../domain/model/BlockAppointment');
const {Error} = require("mongoose");
const {ValidationError, DatabaseError, NotFoundError} = require("../../errors/Error");
const BlockAppointment = require("../../domain/model/BlockAppointment");

class BlockService {
    async findOverlappedBlocks(startTime, endTime, doctorId = 1) {
        try {
            return await Block.find({
                startTime: {$lt: new Date(endTime)},
                endTime: {$gt: new Date(startTime)},
                doctorId: doctorId,
                deletedAt: { $exists: false },
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
        return await Block.findByIdAndUpdate(blockId, { deletedAt: new Date() });
    }
    
    static async checkOverlap({ doctorId, startTime, endTime }) {
        return await Block.findOne({
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
            doctorId,
            deletedAt: { $exists: false },
        });
    }

    async checkForBlocks(startTime, endTime, doctorId, session) {
        const blocks = await BlockAppointment.find({
            doctorId,
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
                { endTime: { $gt: startTime }, startTime: { $lt: endTime } }
            ],
            deletedAt: { $exists: false },
        }).session(session).lean();

        return blocks.length > 0;
    }

    handleError(error) {
        if (error instanceof Error.ValidationError) {
            throw new ValidationError(error.message);
        } else if (error instanceof Error.CastError) {
            throw new ValidationError('Invalid data format');
        } else if (error instanceof NotFoundError) {
             throw error;  
        } else {
            throw new DatabaseError('Database error occurred');
        }
    }
}

module.exports = BlockService;