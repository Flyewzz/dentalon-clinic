// appointmentController.js

const AppointmentManager = require('../services/AppointmentManager');
const SlotManager = require('../services/SlotManager');

const appointmentManager = new AppointmentManager();
// Предполагаем, что SlotManager правильно инициализирован и готов к использованию
const slotManager = new SlotManager(1); // ID врача пока статичен

exports.getAppointments = async (req, res) => {
    try {
        const appointment = await appointmentManager.getAppointments(req);
        res.status(200).json(appointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.createAppointment = async (req, res) => {
    try {
        const appointment = await appointmentManager.bookAppointment(req.body);
        res.status(201).json(appointment);
    } catch (error) {
        res.status(400).json({ message: "wwe" });
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

exports.rescheduleAppointment = async (req, res) => {
    try {
        const appointment = await appointmentManager.rescheduleAppointment(req.params.appointmentId, req.body);
        res.status(200).json(appointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
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