const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema

//create user Schema
const userSchema = new Schema({

    userEmail : {
        type : String,
        required : [true, 'You must provide an email'],
        validate : [validator.isEmail,'Kindly provide a valid email address'],
        unique:true,
        trim: true
    },

    userName : {
        type : String,
        minLength : [5,'User name must have at least 5 characters'],
        trim: true
    },

    userFullName : {
        type : String,
        required: [true, 'You must provide your full name'],
        minLength : [5,'User name must have at least 5 characters'],
        trim: true
    },

    userMobile : {
        type :Number,
        required : [true, 'You must provide a mobile number'],
        min : [11, 'Mobile Number must contain at least 11 characters']
    },

    userRole : {
        type : String,
        enum : ['user', 'admin', 'merchant'],
        default : 'user',
    },

    userFirstAddress : {
        type: String,
        required: [true, 'You must provide an address'],
    },

    userSecondAddress: {
        type: String,
        trim: true
    },

    userState: {
        type: String,
        trim: true
    },

    userCity: {
        type: String,
        trim: true
    },

    emailConfirmationStatus : {
        type : Boolean,
        default : false
    },

    isVerifiedAsMerchant:{
        type:Boolean,
    },

    businessName:{
        type: String,
        trim: true
    },

    businessAddress:{
        type: String,
        trim: true
    },

    businessType:{
        type: String,
        trim: true
    },

    // for regular signup
    profilePicture:{
        type: Buffer,
        select: false
    },

    // for oAuth signup
    imageUrl:{
        type: String,
    },

    registeredOn:{
        type:Date,
        default: Date.now
    },

    upgradeToMerchantOn:{
        type:Date
    },

    password :{
        type : String,
        required : [true,'password is required'],
        minLength : [8,'Password must contain at least 8 characters'],
        select : false
    },

    confirmPassword : {
        type : String,
        require : [true, 'confirm password is required'],

        validate : {
            validator : function(password){
                return password === this.password;
            },
            message : 'Confirm password must be the same as your password'
        }
    },

    passwordChangedAt : Date,

    // This token is use when user wish to verify email or forgot their password
    oneTimeToken : String,
    oneTimeTokenExpires : Date,
    
});

//Hash user Password
userSchema.pre('save', async function(next){
    // If password is not changed then dont hash.
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password,12);
    this.confirmPassword = undefined;
});

userSchema.methods.checkPassword = async function(plainPassword,hashedPassword){
    return await bcrypt.compare(plainPassword,hashedPassword);
};

userSchema.methods.rejectOnPasswordChangeAfterTokenIssued = function(JWT_iat){

    if(this.passwordChangedAt){
        const changedAt = parseInt(this.passwordChangedAt.getTime()/1000,10);
        return JWT_iat < changedAt;
    };

    return false;
};

// generate token for verification or password reset
userSchema.methods.generateOneTimeToken = function(validTill){
        
    const plainOneTimeToken = crypto.randomBytes(16).toString('hex');

    const hashedOneTimeToken = crypto.createHash('sha256').update(plainOneTimeToken).digest('hex');
    this.oneTimeToken = hashedOneTimeToken;
    this.oneTimeTokenExpires = Date.now() + validTill * 60 * 1000;
    
    // console.log({plainOneTimeToken},{hashedOneTimeToken});
    return plainOneTimeToken;
}

//Create Model
const User = mongoose.model('User',userSchema);

module.exports = User;