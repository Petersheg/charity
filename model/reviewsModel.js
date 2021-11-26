const mongoose = require('mongoose');

const reviewsSchema = new mongoose.Schema({
    review:{
        type: String,
        required : [true, 'You must provide a review']
    },
    rating:{
        type: Number,
        min:1,
        max:5,
        required : [true, 'You must provide a rating']
    },
    createdAt:{
        type:Date,
        default: Date.now
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref:"User",
        required : [true, 'Review must have a user']
    },
    product:{
        type: mongoose.Schema.ObjectId,
        ref:"product",
        required: [true, 'Review must have a product']
    }
})

const Reviews = mongoose.model("Reviews",reviewsSchema);
module.exports = Reviews;