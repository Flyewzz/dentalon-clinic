const BlockManager = require('../domain/BlockManager');

exports.createBlock = async (req, res) => {
    try {
        const blockData = req.body;
        const block = await BlockManager.createBlock(blockData);
        res.status(201).send(block);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

exports.deleteBlock = async (req, res) => {
    try {
        const { blockId } = req.params;
        await BlockManager.deleteBlock(blockId);
        res.status(204).send();
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};
