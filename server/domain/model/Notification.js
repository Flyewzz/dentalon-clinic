const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'appointment' },
    originalAppointmentId: { type: String },
    type: { type: String, required: true, enum: [
        'week', 'twoDays', 'threeHours', 'booking', 'reschedule', 'cancellation',
    ] },
    status: { type: String, required: true, enum: ['pending', 'sent', 'failed', 'cancelled'] },
    operationId: { type: String, required: false, unique: false },
    deliveryType: { type: String, required: true, enum: ['sms', 'email'] },
    contact: { type: String, required: true },  // Номер телефона или email
    createdAt: { type: Date, default: Date.now },
    scheduledAt: { type: Date, required: true },
});

// Индексы для оптимизации поиска
notificationSchema.index({ appointmentId: 1, type: 1 }, { unique: true });

const Notification = mongoose.model('notification', notificationSchema);
module.exports = Notification;
