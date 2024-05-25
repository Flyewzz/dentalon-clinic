const Appointment = require("../domain/model/Appointment");
const BlockAppointment = require("../domain/model/BlockAppointment");
const moment = require('moment-timezone');
const {NotFoundError} = require("../errors/Error");

class AppointmentManager {
    constructor(appointmentService) {
        this.appointmentService = appointmentService;
    }
    
    async findAppointments(req) {
        const { startTime, endTime, doctorId} = req.query;
        return await this.appointmentService.findAppointments(new Date(startTime), new Date(endTime), doctorId);
    }
    
    async bookAppointmentForPatient(req) {
        const duration = req.type === 'consultation' ? 15 : 45;
        const startTime = moment(req.startTime).toDate();
        const endTime = moment(req.startTime).clone().add(duration, 'minutes').toDate();

        const overlapped = await this.appointmentService.findAppointments(startTime, endTime);
        if (overlapped.length > 0) {
            throw new NotFoundError('Этот временной слот занят и не может быть забронирован.');
        }
        
        // Проверка на пересечение с блокировками
        const isBlocked = await this.checkForBlocks(startTime, endTime, req.doctorId);
        if (isBlocked) {
            throw new Error('Этот временной слот заблокирован и не может быть забронирован.');
        }

        req.startTime = startTime;
        req.endTime = endTime;
        return await this.appointmentService.addAppointment(req);
    }

    async bookAppointmentForDoctor(req) {
        // Проверка на пересечение с уже существующими бронями
        // const existingAppointments = await this.appointmentService.findAppointments(req.startTime, endTime, req.doctorId);
        // if (existingAppointments.length > 0) {
        //     // Логика предоставления выбора врачу: отмена, перенос или сохранение текущих броней
        // }

        // req.endTime = endTime.toISOString();
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

        update.startTime = new Date(update.startTime);
        update.endTime = new Date(update.endTime);
        
        return await this.appointmentService.updateAppointment(appointmentId, update);
    }

    async checkForBlocks(startTime, endTime, doctorId) {
        const blocks = await BlockAppointment.find({
            doctorId,
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
                { endTime: { $gt: startTime }, startTime: { $lt: endTime } }
            ]
        }).lean();
        
        return blocks.length > 0;
    }

}

module.exports = AppointmentManager;
