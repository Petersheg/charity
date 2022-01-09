const catchAsync = require('../../utility/catchAsync');
const merchant = require('./generalAuth');

exports.signUp = catchAsync(

    async (req,res,next)=>{

        // select only data needed to be saved to the database.
        const fieldsArr = ['userFullName','userEmail','userName','userMobile','userFirstAddress',
            'userSecondAddress','userState','userCity','businessName','businessType','businessAddress', 'password','confirmPassword'];

        await merchant.signUp(req,res,next,fieldsArr,'merchant');
    }
   
);

exports.updateSelf= catchAsync(
    async(req,res,next)=>{
        await merchant.updateSelf(req,res,next);
    }
);

exports.updatePassword = catchAsync(
    async(req,res,next)=>{
       await merchant.updatePassword(req,res,next)
    }
);