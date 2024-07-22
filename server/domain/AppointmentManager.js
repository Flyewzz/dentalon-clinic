const BlockAppointment = require("../domain/model/BlockAppointment");
const TransactionManager = require("../services/mongo/TransactionManager");
const moment = require('moment-timezone');
const {NotFoundError} = require("../errors/Error");

const notificationTypes = [
    { type: 'week', interval: { cnt: 1, unit: 'weeks' } },
    { type: 'twoDays', interval: { cnt: 2, unit: 'days'} },
    { type: 'threeHours', interval: { cnt: 3, unit: 'hours' } },
];

class AppointmentManager {
    constructor(appointmentService, notificationService, transactionManager) {
        this.appointmentService = appointmentService;
        this.notificationService = notificationService;
        this.transactionManager = new TransactionManager();
    }

    async findAppointment(appointmentId)  {
        return await this.appointmentService.findAppointmentById(appointmentId);
    }
    
    async findAppointments(req) {
        const { startTime, endTime, doctorId} = req.query;
        return await this.appointmentService.findAppointments(new Date(startTime), new Date(endTime), doctorId);
    }
    
    async bookAppointmentForPatient(req) {
        const duration = req.type === 'consultation' ? 15 : 45;
        const startTime = moment(req.startTime).toDate();
        const endTime = moment(req.startTime).clone().add(duration, 'minutes').toDate();

        const session = await this.transactionManager.startSession();
        await session.withTransaction(async () => {
            await this.validateTimeInterval(startTime, endTime, req.doctorId, session);

            req.startTime = startTime;
            req.endTime = endTime;

            const appointment = await this.appointmentService.addAppointment(req, session);

            await this.notificationService.createNotifications({
                appointmentId: appointment._id,
                contact: appointment.phone,
                startTime: appointment.startTime,
            }, [...notificationTypes, { type: 'booking' }], session);
        })
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

    async rescheduleAppointment(appointmentId, req) {
        const session = await this.transactionManager.startSession();
        let updatedAppointment;
        
        await session.withTransaction(async () => {
            const appointment = await this.appointmentService.findAppointmentById(
                appointmentId, session,
            );
            const duration = appointment.type === 'consultation' ? 15 : 45;

            const newStartTime = moment(req.startTime).toDate();
            const newEndTime = moment(req.startTime).clone().add(duration, 'minutes').toDate();

            // doctorId = 1
            await this.validateTimeInterval(newStartTime, newEndTime, 1, session);

            updatedAppointment = this.appointmentService.updateAppointment(appointmentId, {
                startTime: newStartTime,
                endTime: newEndTime,
            }, session);

            await this.notificationService.cancelNotificationsByAppointmentId(appointmentId, session);
            await this.notificationService.createNotifications({
                appointmentId: appointment._id,
                contact: appointment.phone,
                startTime: appointment.startTime,
            }, [...notificationTypes, { type: 'reschedule' }], session);
        });

        return updatedAppointment;
    }
    
    async cancelAppointment(appointmentId) {
        const session = await this.transactionManager.startSession();
        
        let appointment;
        await session.withTransaction(async () => {
            await this.notificationService.cancelNotificationsByAppointmentId(appointmentId, session);
            
            appointment = await this.appointmentService.deleteAppointment(appointmentId, session);
            await this.notificationService.createNotification({
                originalAppointmentId: appointmentId,
                contact: appointment.phone,
                type: 'cancellation',
            }, session);
        });
        
        return appointment;
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

    async checkForBlocks(startTime, endTime, doctorId, session) {
        const blocks = await BlockAppointment.find({
            doctorId,
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
                { endTime: { $gt: startTime }, startTime: { $lt: endTime } }
            ]
        }).session(session).lean();
        
        return blocks.length > 0;
    }

    async validateTimeInterval(startTime, endTime, doctorId = 1, session = null){
        const overlapped = await this.appointmentService.findAppointments(startTime, endTime, doctorId, session);
        if (overlapped.length > 0) {
            throw new NotFoundError('Этот временной слот занят и не может быть забронирован.');
        }

        // Проверка на пересечение с блокировками
        const isBlocked = await this.checkForBlocks(startTime, endTime, doctorId, session);
        if (isBlocked) {
            throw new Error('Этот временной слот заблокирован и не может быть забронирован.');
        }
    }
}

module.exports = AppointmentManager;
