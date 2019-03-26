require('console.table');
require('dotenv').config({ path: '.env' });

const axios = require('axios');
const linky = require('@bokub/linky');
const moment = require('moment');
const mongoose = require('mongoose');
const signale = require('signale');

const ElectricityConsumption = require('./models/electricityConsumption');

const postNotificationToTelegram = (electricityConsumption, logDate) => {
    return axios
        .post(
            process.env.PUSHMORE_URL,
            `${logDate}\n\n${electricityConsumption.value} kWh`
        )
        .catch(error =>
            console.log(`Failed to post notification to Telegram : ${error}`)
        );
};

const logElectricityConsumption = (
    electricityConsumption,
    electricityConsumptionUpdated = false
) => {
    let electricityConsumptionLoggedOnDate = '';
    const electricityConsumptionDate = moment(
        electricityConsumption.date
    ).format('MMMM Do YYYY');

    if (electricityConsumptionUpdated) {
        electricityConsumptionLoggedOnDate = `Electricity Consumption updated in database on ${electricityConsumptionDate}`;
    } else {
        electricityConsumptionLoggedOnDate = `Electricity Consumption added to database on ${electricityConsumptionDate}`;
    }

    signale.success(electricityConsumptionLoggedOnDate);
    console.table({
        value: electricityConsumption.value
    });

    return postNotificationToTelegram(
        electricityConsumption,
        electricityConsumptionLoggedOnDate
    );
};

if (process.env.ENV === 'production') {
    mongoose.connect(process.env.MONGODB_HOST, { useNewUrlParser: true });
}

async function retrieveElectricityConsumption() {
    const session = await linky.login(
        process.env.ENEDIS_EMAIL,
        process.env.ENEDIS_PASSWORD
    );

    session
        .getDailyData({
            start: '01/10/2018',
            end: '31/10/2018'
        })
        .then(electricityConsumptions => {
            return Promise.all(
                electricityConsumptions.map(async electricityConsumption => {
                    const newElectricityConsumption = new ElectricityConsumption(
                        electricityConsumption
                    );

                    await ElectricityConsumption.registerElectricityConsumption(
                        newElectricityConsumption
                    );
                    await logElectricityConsumption(newElectricityConsumption);
                })
            );
        })
        .then(() => {
            process.exit();
        })
        .catch(error => {
            signale.fatal(
                `Failed to retrieve electricity consumption: ${error}`
            );
            process.exit();
        });
}

retrieveElectricityConsumption();

module.exports = {
    retrieveElectricityConsumption,
    postNotificationToTelegram
};
