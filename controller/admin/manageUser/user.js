const catchAsync = require("../../../utility/catchAsync");
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

exports.toggleAccount = catchAsync(
    async (req,res,next)=>{
        await reuse.setAccountStatus(req,res,next,User);
    }
)