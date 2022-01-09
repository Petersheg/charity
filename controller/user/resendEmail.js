const catchAsync = require('../../utility/catchAsync');
const OperationalError = require('../../utility/operationalError');
const helperFunction = require('../../utility/helperFunc')
const User= require('../../model/userModel');


exports.resentEmail = catchAsync(
    
    async (req,res, next) => {

        const email = req.body.email;

        const user = await User.findOne({userEmail:email});

        if(!user){
            return next(new OperationalError("User with this email does not exist",401));
        }

        if(user.emailConfirmationStatus){
            return next(new OperationalError("Your account is already activated",406));
        }

        // Delete oneTimeToken  and oneTimeTokenExpires
        user.oneTimeToken = undefined,
        user.oneTimeTokenExpires = undefined
        await user.save({validateBeforeSave : false});

        const emailStatus = await helperFunction.sendVerificationEmail(req,user);

        if(emailStatus === "sent"){
            res.status(200).json({
                status: "success",
                message: "Verification email sent successfully!"
            })
        }else{
            return next(new OperationalError('Something went wrong, kindly try again',500))
        }
    }
);