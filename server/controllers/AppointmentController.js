const config = require('../config');

const AppointmentManager = require('../domain/AppointmentManager');
const NotificationManager = require('../domain/NotificationManager');
const SlotManager = require('../domain/SlotManager');
const AppointmentService = require('../services/mongo/AppointmentService');
const BlockAppointmentService = require('../services/mongo/BlockAppointmentService');
const NotificationService = require('../services/mongo/notifications/NotificationService');

const Schedule = require('../domain/model/Schedule');

const appointmentService = new AppointmentService();
const blockAppointmentService = new BlockAppointmentService();

const notificationService = new NotificationService();
const notificationManager = new NotificationManager(notificationService);

const notificationsEnabled = config.notificationsEnabled === 'true';
const appointmentManager = new AppointmentManager(
    appointmentService, blockAppointmentService, notificationManager, notificationsEnabled,
);
// Предполагаем, что SlotManager правильно инициализирован и готов к использованию
const slotManager = new SlotManager(1); // ID врача пока статичен

exports.findAppointment = async (req, res) => {
    try {
        const {appointmentId} = req.params;
        const appointment = await appointmentManager.findAppointment(appointmentId);
        res.status(200).json(appointment);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
}

exports.findAppointments = async (req, res) => {
    try {
        const appointments = await appointmentManager.findAppointments(req);
        res.status(200).json(appointments);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
}

exports.bookAppointment = async (req, res) => {
    let appointment;
    try {
        if (req.user && req.user.role === 'doctor') {
            appointment = await appointmentManager.bookAppointmentForDoctor(req.body);
        } else {
            appointment = await appointmentManager.bookAppointmentForPatient(req.body);
        }
        res.status(201).json(appointment);
    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message});
    }
};

exports.cancelAppointment = async (req, res) => {
    try {
        await appointmentManager.cancelAppointment(req.params.appointmentId);
        res.status(200).json({ message: 'Запись на прием успешно отменена' });
    } catch (error) {
        res.status(error.statusCode || 400).json({ message: error.message });
    }
};

exports.rescheduleAppointment = async (req, res) => {
    try {
        const appointment = await appointmentManager.rescheduleAppointment(req.params.appointmentId, req.body);
        res.status(200).json(appointment);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
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

exports.getSlots = function(timezone) {
    return async (req, res) => {
        const {date, type} = req.query;  // Принимаем дату через параметры запроса

        try {
            const availableSlots = await slotManager.generateSlots(date, type, timezone);
            res.status(200).json(availableSlots);
        } catch (error) {
            console.error('Error fetching available slots:', error);
            res.status(error.statusCode || 500).json({message: 'Failed to fetch available slots due to an error'});
        }
    }
}

// New endpoint to retrieve questions for a doctor
exports.getDoctorQuestions = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const schedule = await Schedule.findOne({ doctorId });
        if (!schedule) {
            return res.status(404).json({ message: 'Врач не найден' });
        }
        
        res.status(200).json(schedule.questions);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};