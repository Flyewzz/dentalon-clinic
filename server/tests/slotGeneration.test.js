const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); // путь к вашему Express приложению
const connectDB = require('../database');

// Определение схемы и модели слота
const slotSchema = new mongoose.Schema({
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    // Другие поля
});

const Slot = mongoose.model('Slot', slotSchema);

describe('Slot Generation', () => {
    beforeAll(async () => {
        process.env.NODE_ENV = 'test'; // Установить окружение тестов
        await connectDB();
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase(); // Удалить тестовую базу данных
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await Slot.deleteMany({});
    });

    it('should incorrect data', async () => {
        const response = await request(app)
            .post('/api/v1/appointments/')
            .send({
                phone: '+79998887766',
                type: 'consultation',
                startTime: '2023-01-01T09:00:00Z',
                endTime: '2023-01-01T09:15:00Z', // 15 минут для консультации
            });

        expect(response.statusCode).toBe(400);
        // expect(response.body).toBeDefined();
    });
    
    it('should generate slots without conflicts', async () => {
        const response = await request(app)
            .post('/api/v1/appointments/')
            .send({
                name: 'Иван Иванов Иванович',
                phone: '+79998887766',
                type: 'consultation',
                startTime: '2023-01-01T09:00:00Z',
                endTime: '2023-01-01T09:15:00Z', // 15 минут для консультации
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toBeDefined();
    });

    it('should not generate overlapping slots', async () => {
        // Сначала создадим слот
        const slot1 = await request(app)
            .post('/api/v1/appointments/')
            .send({
                name: 'Иван Иванов Иванович',
                phone: '+79998887766',
                type: 'consultation',
                startTime: '2023-01-01T09:00:00Z',
                endTime: '2023-01-01T09:15:00Z', // 15 минут для консультации
            });

        expect(slot1.statusCode).toBe(201);

        // Попробуем создать пересекающийся слот
        const response = await request(app)
            .post('/api/v1/appointments/')
            .send({
                name: 'Петр Петров Петрович',
                phone: '+79997776655',
                type: 'consultation',
                startTime: '2023-01-01T09:05:00Z',
                endTime: '2023-01-01T09:20:00Z', // Пересекается с первым слотом
            });

        expect(response.statusCode).toBe(404); // Ожидаем ошибку из-за пересечения
    });


    // it('should not generate overlapping slots', async () => {
    //     await Slot.create({ startTime: '2023-01-01T09:00:00Z', endTime: '2023-01-01T10:00:00Z' });
    //
    //     const response = await request(app)
    //         .post('/api/slots/generate')
    //         .send({ startDate: '2023-01-01', endDate: '2023-01-07' });
    //
    //     expect(response.statusCode).toBe(200);
    //     const generatedSlots = response.body.slots;
    //
    //     const hasOverlap = generatedSlots.some(slot => {
    //         return (new Date(slot.startTime) < new Date('2023-01-01T10:00:00Z') && new Date(slot.endTime) > new Date('2023-01-01T09:00:00Z'));
    //     });
    //
    //     expect(hasOverlap).toBe(false);
    // });
});
