// appointmentController.js

const AppointmentManager = require('../domain/AppointmentManager');
const SlotManager = require('../domain/SlotManager');
const AppointmentService = require('../services/mongo/AppointmentService');

const appointmentService = new AppointmentService();
const appointmentManager = new AppointmentManager(appointmentService);
// Предполагаем, что SlotManager правильно инициализирован и готов к использованию
const slotManager = new SlotManager(1); // ID врача пока статичен

exports.findAppointments = async (req, res) => {
    try {
        const appointments = await appointmentManager.findAppointments(req);
        res.status(200).json(appointments);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
}

exports.bookAppointment = async (req, res) => {
    try {
        const appointment = await appointmentManager.bookAppointmentForPatient(req.body);
        res.status(201).json(appointment);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.cancelAppointment = async (req, res) => {
    try {
        await appointmentManager.cancelAppointment(req.params.appointmentId);
        res.status(200).json({ message: 'Appointment successfully cancelled' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateAppointment = async (req, res) => {
    try {
        const appointment = await appointmentManager.updateAppointment(req.params.appointmentId, req.body);
        res.status(200).json(appointment);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.getSlots = async (req, res) => {
    const { date } = req.params;  // Принимаем дату через параметры запроса

    try {
        const availableSlots = await slotManager.generateSlots(date);
        res.status(200).json(availableSlots);
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ message: 'Failed to fetch available slots due to an error' });
    }
    
}