// appointmentController.js

const BlockManager = require('../domain/BlockAppointmentManager');
const AppointmentService = require("../services/mongo/BlockAppointmentService");
const BlockService = require("../services/mongo/BlockAppointmentService");

const appointmentService = new AppointmentService();
const blockService = new BlockService();
const blockManager = new BlockManager(blockService, appointmentService);

exports.createBlock = async (req, res) => {
    try {
        const blockData = req.body;
        const block = await blockManager.createBlock(blockData);
        res.status(201).send(block);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.deleteBlock = async (req, res) => {
    try {
        const { blockId } = req.params;
        await blockManager.deleteBlock(blockId);
        res.status(204).send();
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
