const catchAsync = require('../../utility/catchAsync');
const FavoriteItems = require('../../model/product/favorites');
const {storeItems,removeItem,getItems} = require('./general/reuse');

exports.addFavorite = catchAsync(
    async (req,res,next)=>{
       await storeItems(req,res,next,FavoriteItems);
    }
);

exports.removeFavorite = catchAsync(
    async(req,res, next)=>{
        await removeItem(req,res,next,FavoriteItems)
    }
)

exports.getFavorite = catchAsync(
    async(req,res, next)=>{
        await getItems(req,res,next,FavoriteItems)
    }
)