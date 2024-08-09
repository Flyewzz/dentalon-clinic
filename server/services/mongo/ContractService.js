const ContractCounter = require('../../domain/model/ContractCounter');
const { NotFoundError, ValidationError, DatabaseError } = require('../../errors/Error');
const {Error} = require("mongoose");

class ContractService {
    // Функция для создания нового договора с инкрементом
    static async getAndUpdateCurrentContractNumber(session = null) {
        try {
            return await ContractCounter.findByIdAndUpdate(
                { _id: 'contractNumber' },
                { $inc: { currentNumber: 1 } },
                { new: true, upsert: true }
            ).session(session);
        } catch (error) {
            ContractCounter.handleError(error);
        }
    }

    static handleError(error) {
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

module.exports = ContractService;
