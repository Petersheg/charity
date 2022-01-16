const catchAsync = require('../../utility/catchAsync');
const Cart = require('../../model/product/cart');
const {storeItems,removeItem,getItems} = require('./general/reuse');

exports.addToCart = catchAsync(
    async (req,res,next)=>{
       await storeItems(req,res,next,Cart);
    }
);

exports.removeFromCart = catchAsync(
    async(req,res, next)=>{
        await removeItem(req,res,next,Cart);
    }
)

exports.getCart = catchAsync(
    async(req,res, next)=>{
        await getItems(req,res,next,Cart);
    }
)