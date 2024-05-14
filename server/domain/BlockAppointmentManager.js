class BlockManager {
    constructor(blockService, appointmentService) {
        this.blockService = blockService;
        this.appointmentService = appointmentService;
    }
    async createBlock(blockData) {
        // Проверка перекрытия с существующими записями
        const overlappedAppointments = await 
            this.appointmentService.findOverlappedAppointments(blockData);
        
        if (overlappedAppointments) {
            throw new Error('Блокировка перекрывается с существующими записями на прием. Перенесите или отмените их, пожалуйста.');
        }
        
        return await this.blockService.createBlock(blockData);
    }

    async deleteBlock(blockId) {
        return await this.blockService.deleteBlock(blockId);
    }
}

module.exports = BlockManager;