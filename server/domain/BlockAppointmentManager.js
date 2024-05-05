const Block = require('../services/BlockService');

class BlockManager {
    static async createBlock(blockData) {
        // Проверка перекрытия с существующими записями
        const overlap = await Block.checkOverlap(blockData);
        if (overlap) {
            throw new Error('Block overlaps with existing appointments');
        }
        return await Block.createBlock(blockData);
    }

    static async deleteBlock(blockId) {
        return await Block.deleteBlock(blockId);
    }
}
