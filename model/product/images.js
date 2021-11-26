const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    imgUrl:{
        type:String,
        required: [true,"product must have image(s)"]
    }
});

const ProductIMG = mongoose.model("ProductIMG",imageSchema)

