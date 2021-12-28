const catchAsync = require('../../utility/catchAsync');
const SavedItems = require('../../model/product/saved');
const {storeItems} = require('./general/reuse');

exports.saved = catchAsync(
    async (req,res,next)=>{
       await storeItems(req,res,next,SavedItems);
    }
);