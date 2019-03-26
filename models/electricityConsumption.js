const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const ElectricityConsumptionSchema = new mongoose.Schema({
    date: Date,
    value: Number
});

ElectricityConsumptionSchema.plugin(mongoosePaginate);

ElectricityConsumptionSchema.statics.registerElectricityConsumption = function registerElectricityConsumption(
    electricityConsumption
) {
    return this.create(electricityConsumption);
};

ElectricityConsumptionSchema.statics.updateElectricityConsumption = function updateElectricityConsumption(
    electricityConsumptionId,
    newElectricityConsumptionData
) {
    return this.updateOne(
        { _id: electricityConsumptionId },
        newElectricityConsumptionData
    );
};

ElectricityConsumptionSchema.statics.getElectricityConsumption = function getElectricityConsumption(
    electricityConsumptionId
) {
    return this.findById(electricityConsumptionId)
        .then(response => response)
        .catch(error => error);
};

ElectricityConsumptionSchema.statics.getElectricityConsumptions = function getElectricityConsumptions(
    page,
    limit
) {
    if (page && limit) {
        return this.paginate(
            {},
            {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                sort: { date: -1 }
            }
        )
            .then(response => response)
            .catch(error => error);
    } else {
        return this.find()
            .sort({ _id: -1 })
            .exec();
    }
};

const ElectricityConsumption = mongoose.model(
    'electricityConsumption',
    ElectricityConsumptionSchema
);

module.exports = ElectricityConsumption;
