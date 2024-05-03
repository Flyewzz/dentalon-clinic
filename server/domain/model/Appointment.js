const mongoose = require('mongoose');
const {ValidationError} = require("../../errors/Error");

const appointmentSchema = new mongoose.Schema({
    startTime: { type: Date, required: true },  // Начальное время слота, например "09:00"
    endTime: { type: Date, required: true },  // Конечное время слота, например "10:00"
    doctorId: { type: Number, default: 1 },  // ID доктора, пока статически 1
    // Клиентская информация
    name: {
        type: String,
        required: true,
        trim: true, // Автоматически убирает пробелы в начале и конце строки
        validate: {
            validator: function(v) {
                if (!/^[а-яА-ЯёЁa-zA-Z\s\-]+$/u.test(v)) {
                    throw new ValidationError("Invalid name format. Only Cyrillic and Latin letters, hyphens, spaces and periods are allowed.", 'name');
                }
                return true;
            },
            message: props => `${props.value} is not a valid name!`
        },
        minlength: 3,
        maxlength: 100
    },
    phone: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /\+7[0-9]{10}/.test(v);
            },
            message: props => `${props.value} is not a valid Russian phone number!`
        },
        minlength: 12,
        maxlength: 12
    },
    email: {
        type: String,
        maxlength: 50,
        default: '',
        validate: {
            validator: function(v) {
                return v === '' || /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        },
        sparse: true,  // Это свойство позволяет полям быть уникальными и определенными только когда они не пусты
    }, // Опциональный email клиента
});

appointmentSchema.pre('save', function(next) {
    if (this.name) {
        this.name = this.name.replace(/\s+/g, ' ') // Заменяет множественные пробелы на один
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase())
            .join(' ');
    }
    next();
});


const Appointment = mongoose.model('appointment', appointmentSchema);
module.exports = Appointment;
