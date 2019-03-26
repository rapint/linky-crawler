const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const ElectricityConsumption = require('../models/electricityConsumption.js');

const mockedElectricityConsumption = require('./fixtures/electricityConsumption.json');
const mockedElectricityConsumptionsArray = require('./fixtures/electricityConsumptionsArray.json');

let mongoServer;

describe('API', () => {
    beforeAll(done => {
        mongoServer = new MongoMemoryServer();
        mongoServer
            .getConnectionString()
            .then(mongoUri => {
                return mongoose.connect(
                    mongoUri,
                    { useNewUrlParser: true },
                    err => {
                        if (err) done(err);
                    }
                );
            })
            .then(() => done());
    });

    afterAll(done => {
        mongoose.disconnect();
        mongoServer.stop();
        done();
    });

    it('should registerElectricityConsumption correctly', async () => {
        const electricityConsumption = await ElectricityConsumption.registerElectricityConsumption(
            mockedElectricityConsumption
        );
        const result = await ElectricityConsumption.getElectricityConsumption(
            electricityConsumption._id
        );

        expect(result.id + '').toBe(electricityConsumption._id + '');
    });

    it('should updateElectricityConsumption correctly', async () => {
        const electricityConsumption = await ElectricityConsumption.registerElectricityConsumption(
            mockedElectricityConsumption
        );
        await ElectricityConsumption.updateElectricityConsumption(
            electricityConsumption._id,
            mockedElectricityConsumptionsArray[1]
        );

        const result = await ElectricityConsumption.getElectricityConsumption(
            electricityConsumption._id
        );

        delete mockedElectricityConsumptionsArray[1].date;
        delete mockedElectricityConsumptionsArray[1].id;

        expect(result.id + '').toBe(electricityConsumption._id + '');
        expect(result).toMatchObject(mockedElectricityConsumptionsArray[1]);
    });

    it('should getElectricityConsumptions correctly', async done => {
        mockedElectricityConsumptionsArray.map(
            async mockedElectricityConsumption => {
                await ElectricityConsumption.registerElectricityConsumption(
                    mockedElectricityConsumption
                );
            }
        );

        const result = await ElectricityConsumption.getElectricityConsumptions();

        expect(result.length).toBe(2);
        done();
    });

    it('should getElectricityConsumptions with pagination correctly', async done => {
        mockedElectricityConsumptionsArray.map(
            async mockedElectricityConsumption => {
                await ElectricityConsumption.registerElectricityConsumption(
                    mockedElectricityConsumption
                );
            }
        );

        const result = await ElectricityConsumption.getElectricityConsumptions(
            1,
            5
        );

        expect(result.pages).toBe(1);
        expect(result.total).toBe(4);
        done();
    });
});
