const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    date: { type: Date, required: true },  // Хранение даты слота
    startTime: { type: Date, required: true },  // Начальное время слота, например "09:00"
    endTime: { type: Date, required: true },  // Конечное время слота, например "10:00"
    doctorId: { type: Number, default: 1 },  // ID доктора, пока статически 1
    // Клиентская информация
    name: { type: String, required: true, minlength: 3, maxlength: 50 },
    phone: { type: String, required: true, minlength: 3, maxlength: 20 },
    email: { type: String, maxlength: 50, default: '' },  // Опциональный email клиента
});

const Appointment = mongoose.model('appointment', appointmentSchema);
module.exports = Appointment;
