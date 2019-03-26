const axios = require('axios');
const querystring = require('querystring');
const mongoose = require('mongoose');
const MockAdapter = require('axios-mock-adapter');
const { MongoMemoryServer } = require('mongodb-memory-server');

const {
    postNotificationToTelegram,
    retrieveElectricityConsumption
} = require('../retrieveElectricityConsumption.js');

const mockedElectricityConsumption = require('./fixtures/electricityConsumption.json');
const mockedElectricityConsumptionsArray = require('./fixtures/electricityConsumptionsArray.json');

const mock = new MockAdapter(axios);
let mongoServer;

const testRequest = (request, done) => {
    request
        .then(response => {
            expect(response.status).toEqual(200);
            done();
        })
        .catch(error => {
            console.log('error', error);
            done.fail(error);
        });
};

const mockPostNotificationToTelegram = () => {
    mock.onPost(process.env.PUSHMORE_URL).reply(200);
};

const mockPostNotificationToTelegramFail = () => {
    mock.onPost(process.env.PUSHMORE_URL).reply(500);
};

const testPostNotificationToTelegram = (
    mockedElectricityConsumption,
    logDate,
    done
) => {
    postNotificationToTelegram(mockedElectricityConsumption, '06/02/2019')
        .then(response => {
            expect(response.status).toEqual(200);
            done();
        })
        .catch(error => {
            console.log(`Failed to post notification to Telegram : ${error}`);
            done.fail(error);
        });
};

const testPostNotificationToTelegramFail = (
    mockedElectricityConsumption,
    logDate,
    done
) => {
    postNotificationToTelegram(mockedElectricityConsumption, '06/02/2019')
        .then(response => {
            expect(response).toEqual(undefined);
            done();
        })
        .catch(error => {
            console.log('error', error);
            done.fail(error);
        });
};

describe('Crawler to retrieve electricity consumptions', () => {
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

    it('should post notification to Telegram', done => {
        mockPostNotificationToTelegram();
        testPostNotificationToTelegram(
            mockedElectricityConsumption,
            '06/02/2019',
            done
        );
    });

    it('should fail to post notification to Telegram', done => {
        mockPostNotificationToTelegramFail();
        testPostNotificationToTelegramFail(
            mockedElectricityConsumption,
            '06/02/2019',
            done
        );
    });
});
