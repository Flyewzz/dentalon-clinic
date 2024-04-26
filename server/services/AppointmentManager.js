const Appointment = require("../model/Appointment");
const moment = require('moment-timezone');

class AppointmentManager {
    async bookAppointment(req) {
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
