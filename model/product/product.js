const mongoose = require('mongoose');

const productSchema = new mongoose({
    
    productName:{
        type: String,
        required: [true,"Product name is required"]
    },
    details :{
        type:String,
        required:[true,"You must provide product details"]
    },
    color:{
        type:String
    },
    size:{
        type:String
    },
    merchant:[
        {
            type:mongoose.Schema.ObjectId,
            ref: "User",
            required:[true,"Product must have a merchant"]
        }
    ],
    category:{
        type:mongoose.Schema.ObjectId,
        ref: "Category",
        required:[true,"Product must be categorized"]
    },
    images:[
        {
            type:mongoose.Schema.ObjectId,
            ref: "ProductIMG",
            required:[true,"Product must have image(s)"]
        }
    ],
    price:{
        type:mongoose.Schema.ObjectId,
        ref: "Price",
        required:[true,"Product must have price(s)"]
    },

    tags:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"Tag",
            required:[true,"At least one tag is required"]
        }
    ]
    
},{
    toObject:{
        virtual:true,
    },
    toJson:{
        virtual:true
    }
});

const Product = mongoose.model("Product",productSchema);
module.exports = Product;