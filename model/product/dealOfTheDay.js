const mongoose = require('mongoose');

const dodModel = new mongoose.Schema({
    status : {type : String},
    accept : {type : Boolean},
    decline : {type:Boolean},

    dateAdded:{
        type:Date,
        default: new Date
    },

    dateAccepted:{
        type: Date
    },

    dateDeclined: {
        type:Date
    },

    validTill : {
        type : Date
    },

    product:{
        type : mongoose.Schema.ObjectId,
        ref : 'Product'
    },

    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
})

dodModel.methods.checkIfStillValid = function(){
    let expiredOn = new Date();

    if(this.validTill && this.validTill < expiredOn){
        this.status = 'expired';
        this.accept = false;
    }
}

const DealOfTheDay = mongoose.model('DealOfTheDay',dodModel);
module.exports = DealOfTheDay