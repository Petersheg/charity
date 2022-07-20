const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const _ = require('lodash');
const User = require('../../model/userModel');
const OperationalError = require('../../utility/operationalError');
const sendEmail = require('../../utility/emails/email');
const sendGridEmail = require('../../utility/emails/sendGridEmail');
const template = require('../../utility/emails/templates');
const helperFunction = require('../../utility/helperFunc');

exports.signUp = async (req,res,next,fieldsArr,role)=>{

    // select only data needed to be saved to the database.
    const allowFields =  _.pick(req.body,fieldsArr);
    
    // create new user
    const user = await  User.create(allowFields);

    // set default password for new admin
    if(req.originalUrl.includes('/add_admin')){
        user.adminDefaultPass = req.body.password;
    }

    helperFunction.changeUserRole(req,user,role);

    const emailStatus = await helperFunction.sendVerificationEmail(req,user);
    await user.save();
    if(emailStatus === "sent"){
        let message = 'registration successful, kindly login with your email and password';
        helperFunction.generateTokenAndUserData(200,user,res,message);
    }else{
        return next(new OperationalError('Something went wrong, kindly try again',500));
    }
};

exports.updateSelf = async(req,res,next)=>{

    const userId = req.params.userId;
    const user = req.user;

    if(userId != user._id){
        return next(new OperationalError("user not found",404));
    }

    if(req.body.password || req.body.confirmPassword){
        return next(new OperationalError("You can not update your password using this route",406));
    }

    const toUpdate = _.pick(
        req.body,
        ['userFullName','userEmail','userName','userMobile','userFirstAddress',
        'userSecondAddress','userState','userCity','businessName','businessType','businessAddress']);

    const updatedUser = await User.findByIdAndUpdate(user.id, toUpdate, {
        new : true,
        runVAlidators: true
    });

    if(req.originalUrl.includes("upgrade_to_merchant")){
        
        updatedUser.userRole = "merchant";
        updatedUser.upgradeToMerchantOn = Date.now;
        // Check if merchant is not verified yet
        if(!updatedUser.isVerifiedAsMerchant){
            updatedUser.isVerifiedAsMerchant = false;
        }
    }

    await updatedUser.save();

    // return only data needed by client
    const sendToClient = _.pick(
        updatedUser,
        ['id','userFullName','userEmail','userName','userMobile','userFirstAddress',
        'userSecondAddress','userState','userCity','userRole','businessName','businessType','businessAddress','upgradeToMerchantOn']);

    res.status(200).json({
        status: "success",
        message: "Detail(s) updated successfully",
        data: {
            user:sendToClient
        }
    });
};

exports.verifyEmail = async (req,res,next)=>{
       
    const oneTimeToken = req.params.oneTimeToken;
    const hashedOneTimeToken = crypto.createHash('sha256').update(oneTimeToken).digest('hex');

    const user = await User.findOne({
        oneTimeToken : hashedOneTimeToken,
        oneTimeTokenExpires : {$gt  : Date.now()}
    });//Look up user base on oneTimeToken

    if(!user){
        return next(new OperationalError('token expired, kindly request a new one',404));
    }

    try{
        // If user exist set email confirmation to activated and delete oneTimeToken.
        user.emailConfirmationStatus = true;

        user.oneTimeToken = undefined;
        user.oneTimeTokenExpires = undefined;

        await user.save({validateBeforeSave : false});

        res.status(200).json({
            status : 'success',
            message : 'Email successfully activated',
        })

    }catch(err){
        console.log(err.message);
        return next( new OperationalError('Something went wrong, kindly try again',500));
    }

};

exports.login = async (req,res,next) => {

    const {email,password} = req.body;

    // Check if both email and password are provided
    if(!email || !password){
        return next(new OperationalError('Email and Password must be provided',400));
    };

    // If password and email is provided, fetch user and vet password
    const user = await User.findOne({userEmail : email}).select('+password');

    // if password and email does not exist then throw error 
    if(!user || !await user.checkPassword(password,user.password)){
        return next(new OperationalError('Wrong Login Info',400));
    }

    // if(!user.emailConfirmationStatus){
    //     return next(new OperationalError('Kindly verify your email address',400));
    // }

    if(!user.accountStatus){
        return next(new OperationalError('Your account has been deactivated, kindly contact support to re-activate',400))
    }
    
    helperFunction.generateTokenAndUserData(200,user,res,'login successful');
    
}

exports.forgotPassword = async (req, res, next) => {

    // Fetch user with the provided email
    const user = await User.findOne({ userEmail: req.body.email});
    if(!user){
        return next(new OperationalError('User not found',400));
    };

    // if account is registered with oAuth return error
    if(user.modeOfRegistration === 'oAuth'){
        return next(new OperationalError('Your mode of registration do not support this operation',400));
    };

    // set password reset Token
    const oneTimeToken = user.generateOneTimeToken(process.env.ONE_TIME_TOKEN_VALIDITY);//30 minutes validity
    await user.save({validateBeforeSave : false});

    // Send token to the provided email
    const resetURL = `${process.env.REDIRECT_URL}/reset_password/?token=${oneTimeToken}`;

    let emailObj = {
        user,
        greeting : "Hello",
        heading : `RESET YOUR PASSWORD.`,

        message : `You have requested to reset your email, Kindly click of the reset button bellow to
        reset. Kindly ignore if you did not request a password reset.`,

        link : resetURL,
        buttonText : "RESET",

    }

    const html =  template.generateTemplate(emailObj);
    let emailIsSent;

    try{

        if(process.env.NODE_ENV === "development"){
            // Send to a mail trap
            emailIsSent = await sendEmail({
                email : user.userEmail,
                subject : 'Password Reset Email (Expires After 30 minutes)',
                html
            });
            
        }else{
            // send to actual mail
            emailIsSent = await sendGridEmail({
                email : user.userEmail,
                subject : 'Password Reset Email (Expires After 30 minutes)',
                html
            });

        }
        
        // emailIsSent = true;

        if(emailIsSent === "sent"){
            res.status(200).json({
                status : 'success',
                message : 'Message sent to your email, kindly check'
            })
        }

    }catch(err){

        user.oneTimeToken = undefined;
        user.oneTimeTokenExpires = undefined;

        // Save your data after modification
        await user.save({ validateBeforeSave : false });
        console.log(err.message);
        return next(new OperationalError('Unable to send email, kindly try again',500));
    }
}

exports.resetPassword = async (req,res, next)=> {

    const plainResetToken = req.params.oneTimeToken;
    const hashedResetToken = crypto.createHash('sha256').update(plainResetToken).digest('hex');

    const message = "Password was reset successfully";
    
    const user = await User.findOne({
        oneTimeToken : hashedResetToken,
        oneTimeTokenExpires : {$gt  : Date.now() }
    });

    if(!user){
        return next(new OperationalError('invalid or expired token', 404));
    }

    const {password, confirmPassword} = req.body;

    user.password = password;
    user.confirmPassword = confirmPassword;

    user.oneTimeToken = undefined;
    user.oneTimeTokenExpires = undefined;
    await user.save();

    res.status(200).json({
        status : 'success',
        message
    })
}

exports.updatePassword = async(req,res,next)=>{
    
    const userId = req.params.userId;
    const currentUser = await User.findById(userId).select("+password");
    const {currentPassword,password,confirmPassword} = req.body;

    // if account is registered with oAuth return error
    if(currentUser.modeOfRegistration === 'oAuth'){
        return next(new OperationalError('Your mode of registration do not support this operation',400));
    };

    if(currentPassword === "" || !currentPassword){
        return next(new OperationalError("current password is required",400));
    }

    // Check if current password is correct
    let checkPassword = await currentUser.checkPassword(currentPassword,currentUser.password);

    if(!checkPassword){
        return next(new OperationalError("Invalid current password",400));
    }

    currentUser.password = password,
    currentUser.confirmPassword = confirmPassword;
    await currentUser.save();

    res.status(200).json({
        status : "success",
        message: "password changed successfully"
    });
}