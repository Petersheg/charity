const catchAsync = require('../../utility/catchAsync');
const FavoriteItems = require('../../model/product/favorites');
const {storeItems} = require('./general/reuse');

exports.favorite = catchAsync(
    async (req,res,next)=>{
       await storeItems(req,res,next,FavoriteItems);
    }
);