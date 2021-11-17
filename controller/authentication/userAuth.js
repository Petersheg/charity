const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const _ = require('lodash')
const User = require('../../model/userModel');
const catchAsync = require('../../utility/catchAsync');
const OperationalError = require('../../utility/operationalError');
const sendEmail = require('../../utility/email')

const generateJWT = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRES_IN
    });
}

exports.userSignUp = catchAsync(
    
    async (req,res,next)=>{

        // select only data needed to be saved to the database.
        const allowFields =  _.pick(
            req.body,[
            'userFullName','userEmail','userName','userMobile','userFirstAddress',
            'userSecondAddress','userState','userCity','password','confirmPassword'])

        // create new user
        const user = await User.create(allowFields);

        // return only data needed by client
        const sendToClient = _.pick(
            user,
            ['userFullName','userEmail','userName','userMobile','userFirstAddress',
            'userSecondAddress','userState','userCity','userRole']);

        const token = generateJWT(user._id);

        if (token) {

            const oneTimeToken = user.generateOneTimeToken(62 * 60) // 3 days validity
            await user.save({validateBeforeSave : false}); //save changes to model

            try{
                const activateURL = `${process.env.REDIRECT_URL}/user/verify_email/${oneTimeToken}`;
                const html = `<p> Kindly follow this <a href="${activateURL}">activation link</a>to activate your account</p>
                <p> kindly note that this is only valid for just 3 days </p>`
    
                await sendEmail({
                    email : user.userEmail,
                    subject : 'Password Reset Email (Expires After 3 days)',
                    html
                });

                res.status(200).json({
                    status : 'success',
                    message: 'registration successful, kindly check your email for next step',
                    data : {
                        token,
                        user:sendToClient
                    }
                });
    
            }catch(err){
    
                user.oneTimeToken = undefined,
                user.oneTimeTokenExpires = undefined;
    
                // Save your data after modification
                await user.save({ validateBeforeSave : false });
    
                return next(new OperationalError('Unable to send email, kindly try again',500));
            }
        }
    }
);

exports.verifyEmail = catchAsync(

    async (req,res,next)=>{
       
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
            return next( new OperationalError('Something went wrong, kindly try again',500));
        }
    }
)

exports.login = catchAsync(
    async (req,res,next) => {

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
            ['userFullName','userEmail','userName','userMobile','userFirstAddress',
            'userSecondAddress','userState','userCity']);

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
);

exports.secureRoute = catchAsync(
    async (req,res,next)=>{
        const headers = req.headers?.authorization;

        if(!headers || !headers.startsWith('Bearer')){
           next(new OperationalError('You dont have access to this page'));
        }

        let token = headers?.split(' ')[1];

        const data = jwt.verify(token,process.env.JWT_SECRET);

        // Token can still be valid but the bearer might have been deleted
        // Double check if user exist along with the token;

        const validUser = await User.findById(data.id);

        if(!validUser){
            return next(new OperationalError('User not found',400));
        };

        // If user change password after token has being issue then throw error
        if(validUser.rejectOnPasswordChangeAfterTokenIssued(data.iat)){
            return next(new OperationalError('You just change your password, kindly re-login to access this page',401))
        };

        // Grant Access if no error
        req.user = validUser;
        next();
    }
)

exports.forgotPassword = catchAsync(
    async (req, res, next) => {

        // Fetch user with the provided email
        const user = await User.findOne({ userEmail: req.body.email});
        if(!user){
            return next(new OperationalError('User not found',401));
        };

        // set password reset Token
        const oneTimeToken = user.generateOneTimeToken(30); //30 minutes validity
        await user.save({validateBeforeSave : false});
        console.log(oneTimeToken)

        // Send token to the provided email
        try{
            const resetURL = `${process.env.REDIRECT_URL}/users/reset_password/${oneTimeToken}`;
            const html = `<p> Kindly follow this <a href="${resetURL}">reset link</a>to reset your password </p>
                <p>If you did not trigger this kindly ignore, kindly note that this is only valid for just 30 minutes</p>`

            await sendEmail({
                email : user.userEmail,
                subject : 'Password Reset Email (Expires After Thirty minute)',
                html
            });

            res.status(200).json({
                status : 'success',
                message : 'Message sent to your email, kindly check'
            })

        }catch(err){

            user.oneTimeToken = undefined,
            user.oneTimeTokenExpires = undefined;

            // Save your data after modification
            await user.save({ validateBeforeSave : false });

            return next(new OperationalError('Unable to send email, kindly try again',500));
        }
    }
);

exports.resetPassword = catchAsync(
    async (req,res, next)=> {

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

        // return only data needed by client
        const sendToClient = _.pick(
            user,
            ['userFullName','userEmail','userName','userMobile','userFirstAddress',
            'userSecondAddress','userState','userCity','userRole']);

        res.status(200).json({
            status : 'success',
            message,
            data : {
                user:sendToClient 
            }
        })
    }

)