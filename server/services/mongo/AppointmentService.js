const Appointment = require('../../domain/model/Appointment');
const { NotFoundError, ValidationError, DatabaseError } = require('../../errors/Error');
const {Error} = require("mongoose");

class AppointmentService {
    async findAppointmentById(id, session = null) {
        try {
            const appointment = await Appointment.findOne({
                _id: id,
                deletedAt: { $exists: false },
            }).session(session).lean();
            if (!appointment) {
                throw new NotFoundError('Appointment not found');
            }
            return appointment;
        } catch (error) {
            this.handleError(error);
        }
    }

    async findOverlappedAppointments({startTime, endTime, doctorId = 1}, session = null) {
        try {
            return await Appointment.find({
                startTime: {$lt: new Date(endTime)},
                endTime: {$gt: new Date(startTime)},
                doctorId: doctorId,
                deletedAt: { $exists: false },
            }).session(session);
        } catch (error) {
            this.handleError(error);
        }
    }

    async findAppointments(startTime, endTime, doctorId = 1, session = null) {
        try {
            return await Appointment.find({
                startTime: {$lt: endTime},
                endTime: {$gt: startTime},
                doctorId: doctorId,
                deletedAt: { $exists: false },
            }).session(session).lean();
        } catch (error) {
            this.handleError(error);
        }
    }

    async addAppointment(req, session = null) {
        try {
            const appointment = new Appointment(req);
            return await appointment.save({ session });
        } catch (error) {
            this.handleError(error);
        }
    }

    async updateAppointment(id, updateData, session = null) {
        try {
            const appointment = await Appointment.findByIdAndUpdate(
                id, updateData, { new: true, runValidators: true },
            ).session(session).lean();
            if (!appointment) {
                throw new NotFoundError(`Appointment ${id} not found`);
            }
            
            return appointment;
        } catch (error) {
            this.handleError(error);
        }
    }

    async deleteAppointment(appointmentId, session = null) {
        try {
            const result = await Appointment.findByIdAndUpdate(
                appointmentId, { deletedAt: new Date() },
            ).session(session);
            if (!result) {
                throw new NotFoundError(`Appointment ${appointmentId} not found`);
            }

            return result;
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

module.exports = AppointmentService;
