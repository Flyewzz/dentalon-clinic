// appointmentRoutes.js

const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const {authenticateOptional} = require("../middleware/authenticate");

function appointmentRoutes(dependencies) {
    const { tokenService } = dependencies;
    const router = express.Router();

    router.get('/slots', appointmentController.findAppointments);

    router.get('/', appointmentController.getSlots);
    router.post('/', authenticateOptional(tokenService), appointmentController.bookAppointment);
    router.delete('/:appointmentId', appointmentController.cancelAppointment);
    router.put('/:appointmentId', appointmentController.updateAppointment);
    
    return router;
}

module.exports = appointmentRoutes;
