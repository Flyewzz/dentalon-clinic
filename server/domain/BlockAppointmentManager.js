class BlockManager {
    constructor(blockService, appointmentService) {
        this.blockService = blockService;
        this.appointmentService = appointmentService;
    }

    async findBlocks(req) {
        const { startTime, endTime, doctorId} = req.query;
        return await this.blockService.findOverlappedBlocks(startTime, endTime, doctorId);
    }
    
    async createBlock(blockData) {
        // Проверка перекрытия с существующими записями
        const overlappedAppointments = await 
            this.appointmentService.findOverlappedAppointments(blockData);
         
        if (overlappedAppointments && overlappedAppointments.length > 0) {
            throw new Error('Блокировка перекрывается с существующими записями на прием. Перенесите или отмените их, пожалуйста.');
        }
        
        blockData.doctorId = 1;
        return await this.blockService.createBlock(blockData);
    }

    async updateBlock(appointmentId, updateData) {
        updateData.startTime = new Date(updateData.startTime);
        updateData.endTime = new Date(updateData.endTime);

        return await this.blockService.updateBlock(appointmentId, updateData);
    }

    async deleteBlock(blockId) {
        return await this.blockService.deleteBlock(blockId);
    }
}

module.exports = BlockManager;