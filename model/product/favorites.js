const mongoose = require('mongoose');

const favoritesSchema = new mongoose.Schema({

    dateAdded : {
        type : Date,
        default : new Date
    },

    products : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'Product',
            required : [true, 'Product is required']
        }
    ],

    user : {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "User is required"]
    }
});

const FavoriteItems = mongoose.model('FavoriteItems',favoritesSchema);
module.exports = FavoriteItems;