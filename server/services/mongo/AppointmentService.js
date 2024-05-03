const Appointment = require('../../domain/model/Appointment');
const { NotFoundError, ValidationError, DatabaseError } = require('../../errors/Error');
const {Error} = require("mongoose");
const moment = require("moment-timezone");

class AppointmentService {
    async findAppointmentById(id) {
        try {
            const appointment = await Appointment.findById(id);
            if (!appointment) {
                throw new NotFoundError('Appointment not found');
            }
            return appointment;
        } catch (error) {
            this.handleError(error);
        }
    }

    async addAppointment(req) {
        try {
            const appointment = new Appointment(req);
            return await appointment.save();
        } catch (error) {
            this.handleError(error);
        }
    }

    async updateAppointment(id, updateData) {
        try {
            const appointment = await Appointment.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
            if (!appointment) {
                throw new NotFoundError(`Appointment ${id} not found`);
            }
            
            return appointment;
        } catch (error) {
            this.handleError(error);
        }
    }

    async deleteAppointment(appointmentId) {
        try {
            const result = await Appointment.findByIdAndDelete(appointmentId);
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
        } else {
            throw new DatabaseError('Database error occurred');
        }
    }
}

module.exports = AppointmentService;
