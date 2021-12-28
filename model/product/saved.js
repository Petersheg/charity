const mongoose = require('mongoose');

const savedSchema = new mongoose.Schema({

    dateAdded:{
        type: Date,
        default : Date.now
    },

    products:[
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required: [true, "Product is required"]
        }
    ],

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "User is required"],
        unique : true
    }
})

const SavedItems = mongoose.model('SavedItems', savedSchema);
module.exports = SavedItems;