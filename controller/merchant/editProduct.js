const Product = require('../../model/product/product');
const OperationalError = require('../../utility/operationalError');
const catchAsync = require('../../utility/catchAsync');
const reusable = require('../general/reuse');

exports.editProduct = catchAsync(
    async (req,res,next)=>{
        const user = req.user;
        const productId = req.params.Id;
        const product = await Product.findById(productId).select('merchant');

        if(String(product.merchant) !== String(user._id)){
            return next(new OperationalError("you can not edit this product",400));
        }
        reusable.editContent(req,res,next,product,Product)
    }
)