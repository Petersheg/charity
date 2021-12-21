const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    
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
    merchant:{
        type:mongoose.Schema.ObjectId,
        ref: "User",
        required:[true,"Product must have a merchant"]
    },

    
    category:{
        type:new mongoose.Schema({
            genericCat:{type:String},
            specificCat:{type:String},
        },{ _id : false }),

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
        type:new mongoose.Schema({
            productPrice:{type:Number},
            discount:{type:Number},
            offPercentage:{type:Number},
        },{ _id : false }),
        required:[true,"Product must have price(s)"]
    },

    productTags:{type:String},
    newTags:{type:Array, select: false, required:[true,'"At least one tag is required"']},

    inventory:{
        type:new mongoose.Schema({
            sku:{type:String},
            quantity:{type:Number},
            lowStockThreshold:{type:Number},
            inStock:{type:Boolean},
            quantitySold:{type:Number}
        },{ _id : false }),
        required:[true,"Kindly provide inventory information"]
    },

    addedAt:{
        type:Date,
        default: Date.now
    }, 
    
    similarProducts:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"Product"
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

productSchema.methods.detectSimilarProducts = function(products){
    products.filter((product)=>{
        return this.newTags.filter((tag)=>{
            return product.productTags.includes(tag);
        }).length > 2
    }).map( similar => this.similarProducts.push(similar._id));
}
productSchema.methods.removeTemFields = function(){
    this.genericCat = 
    this.productPrice = this.discount = 
    this.sku = this.inStock = 
    this.quantity = this.lowStockThreshold =  undefined;
}

productSchema.methods.calcOffPercent = function(){
    let newDiscount = this.price.discount * 100;
    let newPrice = newDiscount/this.price.productPrice;
    return Math.round(100 - newPrice);
}

productSchema.methods.checkAvailability = function(){
    if(this.isNew){
        this.inventory.inStock = true;
    }

    if(!this.isNew && this.quantity <=  1){
       this.inventory.inStock = false;
    }

    return this.inventory.inStock;
}

const Product = mongoose.model("Product",productSchema);
module.exports = Product;