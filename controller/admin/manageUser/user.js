const catchAsync = require("../../../utility/catchAsync");
const User = require("../../../model/userModel");
const reuse = require('../reuse');

exports.deleteUser = catchAsync(
    async(req,res,next)=>{
        await reuse.deleteController(req, res, next, User, "user");
    }
)