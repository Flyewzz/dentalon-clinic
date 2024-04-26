const DoctorScheduleManager = require('./DoctorScheduleManager');
const AppointmentManager = require('./AppointmentManager');
const Appointment = require('../model/Appointment')
const moment = require('moment-timezone');

class SlotManager {
    constructor(doctorId) {
        this.doctorScheduleManager = new DoctorScheduleManager(doctorId);
        this.appointmentManager = new AppointmentManager();
    }

    async generateSlots(date, timezone = 'Asia/Yerevan') {
        const dayOfWeek = moment.tz(date, timezone).day();
        const schedule = await this.doctorScheduleManager.getSchedule();

        if (!schedule) {
            return []; // Если день заблокирован или расписание не найдено
        }
        
        const workHours = schedule.days.find(d => d.dayOfWeek === dayOfWeek);
        if (!workHours) {
            return [];
        }
        
        let slots = [];
        let startTime = moment(`${date}T${workHours.startTime}`);
        let endTime = moment(`${date}T${workHours.endTime}`);
        
        while (startTime.isBefore(endTime)) {
            let endTimeSlot = startTime.clone().add(1, 'hour'); // Добавляем 1 час

            slots.push({ startTime: startTime, endTime: endTimeSlot });
            startTime = endTimeSlot;
        }

        // Фильтрация уже забронированных слотов
        const appointments = await Appointment.find({
            date: moment(date).startOf('day').toDate(),
            startTime: startTime.date(),
            doctorId: 1  // Пока что статический ID
        });
        
        slots = slots.filter(slot => !appointments.some(app => moment(app.startTime).format() === slot.startTime.toISOString()));
        // slots = slots.map(slot => ({startTime: moment.tz(slot.startTime, timezone), endTime: moment.tz(slot.endTime, timezone)}));
        return slots;
    }
}

module.exports = SlotManager;
