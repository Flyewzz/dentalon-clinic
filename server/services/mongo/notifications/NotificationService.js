const Notification = require('../../../domain/model/Notification');
const { NotFoundError, ValidationError, DatabaseError } = require('../../../errors/Error');
const {Error} = require("mongoose");
const moment = require("moment");

class NotificationService {
    async findNotificationsByType(type, session = null) {
        try {
            return await Notification.find({
                type: type,
                status: 'pending',
                scheduledAt: {$lte: new Date()},
                deletedAt: {$exists: false},
            }).session(session);
        } catch (error) {
            this.handleError(error);
        }
    }

    async createNotification(req, session = null) {
        req.createdAt = new Date();
        req.status = 'pending';
        req.deliveryType = 'sms';
        req.scheduledAt = req.scheduledAt ?? req.createdAt;
            
        try {
            const notification = new Notification(req);
            return await notification.save({ session });
        } catch (error) {
            this.handleError(error);
        }
    }

    async createNotifications(appointmentData, notificationTypes, session = null) {
        const now = new Date();
        const notifications = notificationTypes.map(notificationType => ({
            ...appointmentData,
            createdAt: now,
            scheduledAt: notificationType.interval
                ? moment(appointmentData.startTime)
                    .subtract(notificationType.interval.cnt, notificationType.interval.unit)
                    .toDate()
                : now,
            type: notificationType.type,
            status: 'pending',
            deliveryType: 'sms',
        }));
        
        try {
            await Notification.insertMany(notifications, { session })
        } catch (error) {
            console.error(error);
            this.handleError(error);
        }
    }
    
    async updateNotification(id, updateData, session = null) {
        try {
            const notification = await Notification.findByIdAndUpdate(
                id, updateData, { new: true, runValidators: true }
            ).session(session).lean();
            if (!notification) {
                throw new NotFoundError(`Notification ${id} not found`);
            }

            return notification;
        } catch (error) {
            this.handleError(error);
        }
    }
    
    async deleteNotificationsByAppointmentId(appointmentId, session = null) {
        try {
            await Notification.updateMany(
                {appointmentId, status: 'pending'}, {deletedAt: new Date()},
            ).session(session).lean();
        } catch (error) {
            this.handleError(error);
        }
    }
    
    handleError(error) {
        if (error instanceof Error.ValidationError) {
            throw new ValidationError(error.message);
        } else if (error instanceof Error.CastError) {
            throw new ValidationError('Invalid data format');
        } else if (error instanceof NotFoundError) {
            throw error;
        } else {
            throw new DatabaseError('Database error occurred');
        }
    }
}

module.exports = NotificationService;
