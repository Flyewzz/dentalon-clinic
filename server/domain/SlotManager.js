const DoctorScheduleManager = require('./DoctorScheduleManager');
const Appointment = require('../domain/model/Appointment');
const BlockAppointment = require('../domain/model/BlockAppointment'); // Подключаем модель блокировок
const moment = require('moment-timezone');

class SlotManager {
    constructor(doctorId) {
        this.doctorScheduleManager = new DoctorScheduleManager(doctorId);
    }

    async generateSlots(date, timezone = 'Asia/Yerevan') {
        const dayOfWeek = moment(date).day();
        const schedule = await this.doctorScheduleManager.getSchedule();

        if (!schedule) {
            return []; // Если день заблокирован или расписание не найдено
        }

        const workHours = await schedule.days.find(d => d.dayOfWeek === dayOfWeek);
        if (!workHours) {
            return [];
        }

        let slots = [];
        let startTime = moment(`${date}T${workHours.startTime}`);
        let endTime = moment(`${date}T${workHours.endTime}`);
        let currentTime = startTime;

        while (currentTime.isBefore(endTime)) {
            let endTimeSlot = currentTime.clone().add(1, 'hour'); // Добавляем 1 час

            slots.push({
                startTime: currentTime.toDate(),
                endTime: endTimeSlot.toDate()
            });
            currentTime = endTimeSlot;
        }
        
        // Фильтрация уже забронированных слотов
        const busySlots = await Appointment.find({
            $and: [
                { startTime: { $gte: startTime } },
                { endTime: { $lte: endTime } }
            ],
            doctorId: 1,
        }).lean(); // Преобразование в JS объекты для уменьшения нагрузки

        const blocks = await BlockAppointment.find({
            doctorId: 1,
            $and: [
                { startTime: { $lte: endTime } },
                { endTime: { $gte: startTime } }
            ],
        }).lean(); // Получаем активные блокировки

        // Фильтрация слотов на стороне сервера с учетом блокировок
        return slots.filter(slot => {
            return !busySlots.some(busy =>
                (busy.startTime < slot.endTime && busy.endTime > slot.startTime)
            ) && !blocks.some(block =>
                (block.startTime < slot.endTime && block.endTime > slot.startTime)
            );
        });
    }
}

module.exports = SlotManager;
