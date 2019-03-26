require('dotenv').config({ path: '.env' });

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_HOST, { useNewUrlParser: true });

mongoose.connection
    .once('open', function() {
        console.log('Connection established to Linky database');
    })
    .on('error', function(error) {
        console.log('Cannot connect to mongodb Linky database', error);
    });
