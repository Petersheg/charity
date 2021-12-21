const mongoose = require('mongoose');

const reviewsSchema = new mongoose.Schema({
    review:{
        type: String,
        required : [true, 'You must provide a review']
    },
    rating:{
        type: Number,
        min:[1,'Rating can not be less than a star'],
        max:[5,'Rating can not exceed 5 stars'],
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