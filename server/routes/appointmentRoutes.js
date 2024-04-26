// appointmentRoutes.js

const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.get('/:date', appointmentController.getSlots);
router.post('/', appointmentController.createAppointment);
router.delete('/:appointmentId', appointmentController.cancelAppointment);
router.put('/:appointmentId', appointmentController.rescheduleAppointment);

module.exports = router;
