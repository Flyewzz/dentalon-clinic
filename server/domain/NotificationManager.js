const moment = require("moment");

const notificationTypes = [
    { type: 'week', interval: { cnt: 1, unit: 'weeks' } },
    { type: 'twoDays', interval: { cnt: 2, unit: 'days'} },
    { type: 'threeHours', interval: { cnt: 3, unit: 'hours' } },
];

class NotificationManager {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    
    async createBookingNotifications(appointment, session = null) {
        const filteredNotificationTypes = this.filterNotificationTypes(appointment.startTime);
        await this.notificationService.createNotifications({
            appointmentId: appointment._id,
            contact: appointment.phone,
            startTime: appointment.startTime,
        }, [...filteredNotificationTypes, { type: 'booking' }], session);
    }

    async createRescheduleNotifications(appointment, session = null) {
        await this.notificationService.deleteNotificationsByAppointmentId(appointment._id, session);
        const filteredNotificationTypes = this.filterNotificationTypes(appointment.startTime);
        await this.notificationService.createNotifications({
            appointmentId: appointment._id,
            contact: appointment.phone,
            startTime: appointment.startTime,
        }, [...filteredNotificationTypes, { type: 'reschedule' }], session);
    }

    async createCancelNotification(appointment, session = null) {
        await this.notificationService.createNotification({
            appointmentId: appointment._id,
            appointmentTime: appointment.startTime,
            contact: appointment.phone,
            type: 'cancellation',
        }, session);
    }
    async deleteNotificationsByAppointmentId(appointmentId, session = null) {
        await this.notificationService.deleteNotificationsByAppointmentId(appointmentId, session);
    }

    filterNotificationTypes(startTime) {
        const now = moment();
        return notificationTypes.filter(notificationType => {
            const notificationTime = moment(startTime).subtract(
                notificationType.interval.cnt, notificationType.interval.unit,
            );
            return now.isBefore(notificationTime);
        });
    }
}

module.exports = NotificationManager;
