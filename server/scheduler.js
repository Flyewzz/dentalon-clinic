// const sendSMS = require('./SMSSender');
const schedule = require('node-schedule');
const NotificationService = require("./services/mongo/notifications/NotificationService");
const connectDB = require('./database');

connectDB();

class Sender {
    async send(notification) {
        // throw Error("http gateway unavailable");
        console.log(`notification ${notification.id}, ${notification.type} has been sent to phone number ${notification.contact}`);
    }
}

class NotificationScheduler {
    constructor(notificationService, sender) {
        this.notificationService = notificationService;
        this.sender = sender;
    }
    
    async process(type) {
        const notifications = await this.notificationService.findNotificationsByType(type);
        const tasks = notifications.map(async notification => {
            let status;
            try {
                await this.sender.send(notification);
                status = 'sent';
            } catch (error) {
                status = 'failed';
                console.error('Ошибка при отправке SMS:', error);
            } finally {
                await this.notificationService.updateNotification(notification._id, {status});
            }
        })
        
        await Promise.all(tasks);
    }
}

const notificationService = new NotificationService();
const sender = new Sender();
const notificationScheduler = new NotificationScheduler(notificationService, sender);

// // Запуск проверки каждую неделю в понедельник в 00:00
// schedule.scheduleJob('0 0 * * *', () => notificationScheduler.process('week'));
//
// // Запуск проверки каждые два дня в 00:00
// schedule.scheduleJob('0 0 */2 * *', () => notificationScheduler.process('twoDays'));
//
// // Запуск проверки каждый час в 00 минут (каждые три часа)
// schedule.scheduleJob('0 */3 * * *', () => notificationScheduler.process('threeHours'));
//

// Запуск проверки каждую неделю в понедельник в 00:00
schedule.scheduleJob('* * * * *', () => notificationScheduler.process('week'));

// Запуск проверки каждые два дня в 00:00
schedule.scheduleJob('* * * * *', () => notificationScheduler.process('twoDays'));

// Запуск проверки каждый час в 00 минут (каждые три часа)
schedule.scheduleJob('* * * * *', () => notificationScheduler.process('threeHours'));
//
// // Запуск проверки каждые 5 минут
schedule.scheduleJob('* * * * *', () => notificationScheduler.process('booking'));

schedule.scheduleJob('* * * * *', () => notificationScheduler.process('reschedule'));

schedule.scheduleJob('* * * * *', () => notificationScheduler.process('cancellation'));

// // Запуск проверки каждые 5 минут
// schedule.scheduleJob('* * * * *', () => notificationScheduler.process('booking'));

// notificationScheduler.process('booking');

module.exports = NotificationScheduler;
