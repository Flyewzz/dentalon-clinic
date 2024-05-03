const mongoose = require('mongoose');
const Schedule = require('../domain/model/Schedule');

class DoctorScheduleManager {
    constructor(doctorId) {
        this.doctorId = doctorId;
    }

    async setSchedule(scheduleData) {
        const schedule = new Schedule({ ...scheduleData, doctorId: this.doctorId });
        await schedule.save();
    }

    async getSchedule() {
        return await Schedule.findOne({ doctorId: this.doctorId });
    }

    async updateSchedule(updateData) {
        return await Schedule.findOneAndUpdate({ doctorId: this.doctorId }, updateData, { new: true });
    }
}

module.exports = DoctorScheduleManager;
