const Appointment = require("../domain/model/Appointment");
const moment = require('moment-timezone');

class AppointmentManager {
    constructor(appointmentService) {
        this.appointmentService = appointmentService;
    }
    
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
        return await this.appointmentService.addAppointment(req);
    }

    async cancelAppointment(appointmentId) {
        return await this.appointmentService.deleteAppointment(appointmentId)
    }

    async updateAppointment(appointmentId, updateData) {
        // Копируем данные, чтобы избежать изменения исходного объекта
        const update = {...updateData};
        // Удаляем дату из обновлений, если она есть
        delete update.date;

        update.startTime = new Date(update.start);
        update.endTime = new Date(update.end);
        delete update.start;
        delete update.end;
        
        return await this.appointmentService.updateAppointment(appointmentId, update);
    }
}

module.exports = AppointmentManager;
