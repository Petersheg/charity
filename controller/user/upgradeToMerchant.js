const {updateSelf} = require('../authentication/generalAuth');
const catchAsync = require('../../utility/catchAsync');

exports.upgradeToMerchant = catchAsync(
    async(req,res, next)=>{
        await updateSelf(req,res,next);
    }
)