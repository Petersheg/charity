const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    datePurchased : {
        type : Date,
        default : new Date
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true,'customer is required']
    }
});

const Customer = mongoose.model('Customer',customerSchema);

module.exports = Customer;