const Appointment = require("../model/Appointment");
const moment = require('moment-timezone');

class AppointmentManager {

    async getAppointments(req) {
        const { startTime, endTime, doctorId = 1 } = req.query;
        return await Appointment.find({
            startTime: {$gte: new Date(startTime)},
            endTime: {$lte: new Date(endTime)},
            doctorId: doctorId,
        });
    }
    async bookAppointment(req) {
        req.endTime = moment(req.startTime).clone().add(1, 'hour').toISOString();
        const appointment = new Appointment(req);
        return await appointment.save();
    }

    async cancelAppointment(appointmentId) {
        const result = await appointment_info.findByIdAndDelete(appointmentId);
        if (!result) {
            throw new Error('Appointment not found');
        }
        
        return result;
    }

    async rescheduleAppointment(appointmentId, { date, time }) {
        const updatedAppointment = await appointment_info.findByIdAndUpdate(appointmentId, { date, time }, { new: true });
        if (!updatedAppointment) {
            throw new Error('Appointment not found');
        }
        
        return updatedAppointment;
    }
}

module.exports = AppointmentManager;
