const catchAsync = require('../../utility/catchAsync');
const user = require('./generalAuth');


exports.userSignUp = catchAsync(

    async (req,res,next)=>{

        // select only data needed to be saved to the database.
        const fieldsArr = ['userFullName','userEmail','userName','userMobile','userFirstAddress',
            'userSecondAddress','userState','userCity','password','confirmPassword']

        // return only data needed by client
        const toClientArr = ['id','userFullName','userEmail','userName','userMobile','userFirstAddress',
            'userSecondAddress','userState','userCity','userRole'];

        await user.signUp(req,res,next,fieldsArr,toClientArr);
    }
   
);

exports.verifyEmail = catchAsync(
    async (req,res,next)=>{
        await user.verifyEmail(req,res,next);
    }
);

exports.login = catchAsync(
    async (req,res,next) => {
       await user.login(req,res,next)
    }
);

exports.forgotPassword = catchAsync(
    async (req, res, next) => {
        await user.forgotPassword(req,res,next);
    }
);

exports.resetPassword = catchAsync(
    async (req,res, next)=> {
       await user.resetPassword(req,res,next);
    }

);

exports.updateSelf= catchAsync(
    async(req,res,next)=>{
        await user.updateSelf(req,res,next);
    }
);

exports.updatePassword = catchAsync(
    async(req,res,next)=>{
       await user.updatePassword(req,res,next)
    }
);