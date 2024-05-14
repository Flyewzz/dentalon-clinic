// appointmentRoutes.js

const express = require('express');
const blockController = require('../controllers/BlockController');
const {authenticatedDoctor} = require("../middleware/authenticate");

function blockRoutes(dependencies) {
    const router = express.Router();
    
    router.use(authenticatedDoctor(dependencies.tokenService));
    
    router.get('/', blockController.findBlocks);
    router.post('/', blockController.createBlock);
    router.put('/:blockId', blockController.updateBlock);
    router.delete('/:blockId', blockController.deleteBlock);

    return router;
}

module.exports = blockRoutes;

