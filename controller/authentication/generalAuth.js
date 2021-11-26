const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const _ = require('lodash');
const User = require('../../model/userModel');
const OperationalError = require('../../utility/operationalError');
const sendEmail = require('../../utility/emails/email');
const sendGridEmail = require('../../utility/emails/sendGridEmail');
const template = require('../../utility/emails/templates');

const generateJWT = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRES_IN
    });
}

exports.signUp = async (req,res,next,fieldsArr,toClientArr)=>{

    // select only data needed to be saved to the database.
    const allowFields =  _.pick(req.body,fieldsArr)
    
    // create new user
    const user = await  User.create(allowFields);

    if(req.originalUrl.includes("merchants")){
        user.userRole="merchant";
        user.isVerifiedAsMerchant = false;
    }

    // return only data needed by client
    const sendToClient = _.pick(user,toClientArr);

    const token = generateJWT(user._id);

    if (token) {

        const oneTimeToken = user.generateOneTimeToken(62 * 60) // 3 days validity
        await user.save({validateBeforeSave : false}); //save changes to model

        // Send token to the provided email
        const activateURL = `${process.env.REDIRECT_URL}/users/verify_email/${oneTimeToken}`;

        let emailObj = {
            user,
            greeting : "WELCOME",
            heading : `KINDLY VERIFY YOUR EMAIL.`,

            message : `A warm welcome to PICKORDER, We are glad to have you here,
                        you have taken the first step, complete the next by verifying your 
                        email address to complete your registration.
                        Kindly click on the verify button bellow to complete your registration.`,

            link : activateURL,
            buttonText : "VERIFY",
    
        }

        const html =  template.generateTemplate(emailObj)

        let emailIsSent;

        try{

            if(process.env.NODE_ENV === "developmen"){
                // Send to a mail trap
                emailIsSent = await sendEmail({
                    email : user.userEmail,
                    subject : 'Activate your Email (Expires After 3 days)',
                    html
                });
                
            }else{
                // send to actual mail
                emailIsSent = await sendGridEmail({
                    email : user.userEmail,
                    subject : 'Activate your Email (Expires After 3 days)',
                    html
                });
    
            }

            // emailIsSent = true;

            if(emailIsSent){

                res.status(200).json({
                    status : 'success',
                    message: 'registration successful, kindly check your email for next step',
                    data : {
                        token,
                        user:sendToClient
                    }
                });
            }

        }catch(err){

            console.log(err.message);
            await User.findOneAndDelete({_id:user._id});
            return next(new OperationalError('Something went wrong, kindly try again',500));
        }
    }
};

exports.updateSelf = async(req,res,next)=>{

    const userId = req.params.userId;
    const user = req.user;

    if(userId != user._id){
        return next(new OperationalError("user not found",400));
    }

    if(req.body.password || req.body.confirmPassword){
        return next(new OperationalError("You can not update your password using this route"));
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
        'userSecondAddress','userState','userCity','userRole','businessName','businessType','businessAddress']);

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

    const user = await User.findOne({oneTimeToken : hashedOneTimeToken});//Look up user base on oneTimeToken

    if(!user){
        return next(new OperationalError('User does not exist',404))
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
        return next(new OperationalError('Email and Password must be provided',401));
    };

    // If password and email is provided, fetch user and vet password
    const user = await User.findOne({userEmail : email}).select('+password');

    // if password and email does not exist then throw error 
    if(!user || !await user.checkPassword(password,user.password)){
        return next(new OperationalError('Wrong Login Info',400));
    }

    if(!user.emailConfirmationStatus){
        return next(new OperationalError('Kindly verify your email address',400))
    }

    // filter what client see
    const sendToClient = _.pick(
        user,
        ['id','userFullName','userEmail','userName','userMobile','userFirstAddress',
        'userSecondAddress','userState','userCity','userRole','businessName','businessType','businessAddress']);

    const token = generateJWT(user._id);
    
    res.status(200).json({
        status : 'success',
        message: 'login successful',
        data:{
            token,
            user:sendToClient
        }
    });
}

exports.forgotPassword = async (req, res, next) => {

    // Fetch user with the provided email
    const user = await User.findOne({ userEmail: req.body.email});
    if(!user){
        return next(new OperationalError('User not found',401));
    };

    // set password reset Token
    const oneTimeToken = user.generateOneTimeToken(30); //30 minutes validity
    await user.save({validateBeforeSave : false});

    // Send token to the provided email
    const resetURL = `${process.env.REDIRECT_URL}/users/reset_password/${oneTimeToken}`;

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
                subject : 'Password Reset Email (Expires After Thirty minute)',
                html
            });
            
        }else{
            // send to actual mail
            emailIsSent = await sendGridEmail({
                email : user.userEmail,
                subject : 'Password Reset Email (Expires After Thirty minute)',
                html
            });

        }
        
        // emailIsSent = true;

            if(emailIsSent){

                res.status(200).json({
                    status : 'success',
                    message : 'Message sent to your email, kindly check'
                })
            }

    }catch(err){

        user.oneTimeToken = undefined,
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
        return next(new OperationalError('Invalid token', 404));
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

    if(currentPassword === "" || !currentPassword){
        return next(new OperationalError("current password is required"));
    }

    // Check if current password is correct
    let checkPassword = await currentUser.checkPassword(currentPassword,currentUser.password);

    if(!checkPassword){
        return next(new OperationalError("Invalid current password"));
    }

    currentUser.password = password,
    currentUser.confirmPassword = confirmPassword;
    await currentUser.save();

    res.status(200).json({
        status : "success",
        message: "password changed successfully"
    })
}