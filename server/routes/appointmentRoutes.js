// appointmentRoutes.js

const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.get('/slots', appointmentController.findAppointments);

router.get('/', appointmentController.getSlots);
router.post('/', appointmentController.bookAppointment);
router.delete('/:appointmentId', appointmentController.cancelAppointment);
router.put('/:appointmentId', appointmentController.updateAppointment);

module.exports = router;
