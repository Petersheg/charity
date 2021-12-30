const catchAsync = require('../../utility/catchAsync');
const SavedItems = require('../../model/product/saved');
const {storeItems,removeItem,getItems} = require('./general/reuse');

exports.addSave = catchAsync(
    async (req,res,next)=>{
       await storeItems(req,res,next,SavedItems);
    }
);

exports.removeSaved = catchAsync(
    async(req,res, next)=>{
        await removeItem(req,res,next,SavedItems);
    }
)

exports.getSaved = catchAsync(
    async(req,res, next)=>{
        await getItems(req,res,next,SavedItems);
    }
)