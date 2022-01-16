const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({

    createdAt : {
        type:Date,
        default : Date.now
    },

    products:[
        {
            type: mongoose.Schema.ObjectId,
            ref:"Product",
            required:[true,"kindly add product to the cart"]
        }
    ],

    user : {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "User is required"],
        unique : true
    }

})

const Cart = mongoose.model("Cart",cartSchema);
module.exports = Cart;