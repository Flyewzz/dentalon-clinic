const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    doctorId: { type: Number, default: 1 },  // Пока что статический ID
    days: [{
        dayOfWeek: Number,  // 0 - Воскресенье, 1 - Понедельник, ..., 6 - Суббота
        startTime: String,  // Начало работы, например, "09:00"
        endTime: String,    // Конец работы, например, "18:00"
        blocked: Boolean    // Признак блокировки работы в этот день
    }],
    questions: [{
        question: { type: String, required: true },
        options: { type: [String], default: ['Да', 'Нет'] }
    }]
});

const Schedule = mongoose.model('schedule', scheduleSchema);
module.exports = Schedule;
