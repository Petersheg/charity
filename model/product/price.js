const mongoose = require('mongoose');

const priceSchema = new mongoose({

    price:{
        type: Number,
        required: [true,"Price is required"]
    },

    discount: {
        type: Number,
        validate: {
            validator:(value)=>{
                let message;
                if(value >= price){
                    message = "discount price must be less than actual price"
                }
                return message;
            }
        }
    },

    offPercentage:{
        type: Number,
    }
});

priceSchema.methods.calcOffPercent = ()=>{
    let newDiscount = this.discount * 100;
    let newPrice = newDiscount/this.price;
    return Math.round(100 - newPrice);
}

const Price = mongoose.model("Price", priceSchema);
module.exports = Price;