// appointmentRoutes.js

const express = require('express');
const appointmentController = require('../controllers/AppointmentController');
const {authenticateOptional} = require("../middleware/authenticate");

function appointmentRoutes(dependencies) {
    const { tokenService, timezone } = dependencies;
    const router = express.Router();

    router.get('/slots', appointmentController.findAppointments);

    router.get('/', appointmentController.getSlots(timezone));
    router.post('/', authenticateOptional(tokenService), appointmentController.bookAppointment);
    router.delete('/:appointmentId', appointmentController.cancelAppointment);
    router.put('/:appointmentId', appointmentController.updateAppointment);
    
    return router;
}

module.exports = appointmentRoutes;
