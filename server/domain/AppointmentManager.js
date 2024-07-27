const TransactionManager = require("../services/mongo/TransactionManager");
const moment = require('moment-timezone');
const {NotFoundError} = require("../errors/Error");

class AppointmentManager {
    constructor(
        appointmentService, blockAppointmentService, notificationManager, notificationsEnabled = true,
    ) {
        this.appointmentService = appointmentService;
        this.notificationManager = notificationManager;
        this.blockAppointmentService = blockAppointmentService;
        this.transactionManager = new TransactionManager();
        this.notificationsEnabled = notificationsEnabled;
    }

    async findAppointment(appointmentId)  {
        return await this.appointmentService.findAppointmentById(appointmentId);
    }
    
    async findAppointments(req, session = null) {
        const { startTime, endTime, doctorId} = req.query;
        return await this.appointmentService.findAppointments(
            new Date(startTime), new Date(endTime), doctorId,
        );
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
            if (this.notificationsEnabled) {
                await this.notificationManager.createBookingNotifications(appointment, session);
            }
        });
    }

    async bookAppointmentForDoctor(req) {
        const session = await this.transactionManager.startSession();
        let appointment;
        await session.withTransaction(async () => {
            appointment = await this.appointmentService.addAppointment(req, session);
            if (this.notificationsEnabled) {
                await this.notificationManager.createBookingNotifications(appointment, session);
            }
        });
        
        return appointment;
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

            updatedAppointment = await this.appointmentService.updateAppointment(appointmentId, {
                startTime: newStartTime,
                endTime: newEndTime,
            }, session);

            if (this.notificationsEnabled) {
                await this.notificationManager.createRescheduleNotifications(updatedAppointment, session);
            }
        });

        return updatedAppointment;
    }
    
    async cancelAppointment(appointmentId) {
        const session = await this.transactionManager.startSession();
        
        let appointment;
        await session.withTransaction(async () => {
            await this.notificationManager.deleteNotificationsByAppointmentId(appointmentId, session);
            
            appointment = await this.appointmentService.deleteAppointment(appointmentId, session);
            if (this.notificationsEnabled) {
                await this.notificationManager.createCancelNotification(appointment, session);
            }
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

        const session = await this.transactionManager.startSession();
        let updatedAppointment;

        await session.withTransaction(async () => {
            const appointment = await this.appointmentService.findAppointmentById(appointmentId, session);

            // Store the results of the condition checks in variables
            const isStartTimeChanged = update.startTime.getTime() !== appointment.startTime.getTime();
            const isEndTimeChanged = update.endTime.getTime() !== appointment.endTime.getTime();

            // Validate the update time interval if the condition is true
            if (isStartTimeChanged || isEndTimeChanged) {
                await this.validateUpdateTimeInterval(appointmentId, update, session);
            }

            // Perform the update operation
            updatedAppointment = await this.appointmentService.updateAppointment(appointmentId, update, session);

            // Create reschedule notifications if the condition is true
            if (isStartTimeChanged || isEndTimeChanged) {
                await this.notificationManager.createRescheduleNotifications(updatedAppointment, session);
            }
        });

        return updatedAppointment;
    }

    async validateTimeInterval(startTime, endTime, doctorId = 1,  session = null){
        const overlapped = await this.appointmentService.findAppointments(startTime, endTime, doctorId, session);
        if (overlapped.length > 0) {
            throw new NotFoundError('Этот временной слот занят и не может быть забронирован.');
        }

        // Проверка на пересечение с блокировками
        const isBlocked = await this.blockAppointmentService.checkForBlocks(
            startTime, endTime, doctorId, session,
        );
        if (isBlocked) {
            throw new Error('Этот временной слот заблокирован и не может быть забронирован.');
        }
    }

    async validateUpdateTimeInterval(appointmentId, update, session = null){
        const overlapped = await this.appointmentService.findAppointments(
            update.startTime, update.endTime, 1, session,
        );
        if (overlapped.length > 0 && overlapped.some(overlap => overlap._id.toString() !== appointmentId)) {
            throw new NotFoundError('Этот временной слот занят и не может быть забронирован.');
        }

        const isBlocked = await this.blockAppointmentService.checkForBlocks(
            update.startTime, update.endTime, 1, session,
        );
        if (isBlocked) {
            throw new Error('Этот временной слот заблокирован и не может быть забронирован.');
        }
    }
}

module.exports = AppointmentManager;
