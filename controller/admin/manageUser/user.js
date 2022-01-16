const catchAsync = require("../../../utility/catchAsync");
const OperationalError = require('../../../utility/operationalError');
const User = require("../../../model/userModel");
const reuse = require('../../general/reuse');
const auth = require('../../authentication/generalAuth');

exports.deleteUser = catchAsync(
    async(req,res,next)=>{
        await reuse.deleteController(req, res, next,"user",User);
    }
)

exports.registerAdmin = catchAsync(
    async (req,res,next)=>{
        // select only data needed to be saved to the database.
        const fieldsArr = 
        ['userFullName','userEmail','userName','userMobile',
        'userFirstAddress','privileges','password','confirmPassword'];
        await auth.signUp(req,res,next,fieldsArr,'admin');
    }
);

exports.editAdminDetails = catchAsync(
    async (req,res,next)=>{
        await reuse.editController(req,res,next,'admin',User);
    }
)

exports.adminUpdateSelf = catchAsync(
    async (req,res,next)=>{
        
        if(req.params.Id !== String(req.user._id)){
            return next(new OperationalError('you can only modify your own details',406));
        }

        if(req.body.privileges){
            return next(new OperationalError('you can not modify your privileges',406));
        }

        await reuse.editController(req,res,next,'details',User);
    }
)

exports.toggleAccount = catchAsync(
    async (req,res,next)=>{
        await reuse.setAccountStatus(req,res,next,User);
    }
)

exports.setPasswordToDefault = catchAsync(
    async(req,res,next)=>{
        await reuse.setPasswordToDefault(req,res,next,User);
    }
)

exports.getUser = catchAsync(
    async(req,res,next)=>{
        await reuse.getController(req,res,next,'user',User);
    }
)
