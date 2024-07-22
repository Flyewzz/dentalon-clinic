// appointmentRoutes.js

const express = require('express');
const appointmentController = require('../controllers/AppointmentController');
const {authenticateOptional} = require("../middleware/authenticate");

function appointmentRoutes(dependencies) {
    const { tokenService, timezone } = dependencies;
    const router = express.Router();

    router.get('/slots', appointmentController.findAppointments);

    router.get('/:appointmentId', appointmentController.findAppointment);
    router.get('/', appointmentController.getSlots(timezone));
    router.post('/', authenticateOptional(tokenService), appointmentController.bookAppointment);
    router.put('/:appointmentId/schedule', appointmentController.rescheduleAppointment);
    router.delete('/:appointmentId', appointmentController.cancelAppointment);
    router.put('/:appointmentId', appointmentController.updateAppointment);
    router.get('/doctor/:doctorId/questions', appointmentController.getDoctorQuestions);
    
    return router;
}

module.exports = appointmentRoutes;
