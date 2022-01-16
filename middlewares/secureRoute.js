const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const catchAsync = require('../utility/catchAsync');
const OperationalError = require('../utility/operationalError');


exports.secureRoute = catchAsync(
    async (req,res,next)=>{
        const headers = req.headers?.authorization;

        if(!headers || !headers.startsWith('Bearer')){
           return next(new OperationalError('You dont have access to this page',401));
        }

        let token = headers?.split(' ')[1];

        if(!token){
            return next(new OperationalError('You dont have access to this page',401));
        }
        
        const data = jwt.verify(token,process.env.JWT_SECRET);

        // Token can still be valid but the bearer might have been deleted
        // Double check if user exist along with the token;

        const validUser = await User.findById(data.userId);

        if(!validUser){
            return next(new OperationalError('User not found',404));
        };

        // If user change password after token has being issue then throw error
        if(validUser.rejectOnPasswordChangeAfterTokenIssued(data.iat)){
            return next(new OperationalError('You just change your password, kindly re-login with your new password',401))
        };

        // Grant Access if no error
        req.user = validUser;
        next();
    }
);