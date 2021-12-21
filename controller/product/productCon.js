const OperationalError = require('../../utility/operationalError');
const catchAsync = require('../../utility/catchAsync');
const Product = require('../../model/product/product');
const helperFunc = require('../../utility/helper');

exports.getProduct = catchAsync(

    async(req,res,next)=>{

        const productId = req.params.productId;

        let product ;
        if(productId){
            product = Product.findById(productId).populate('similarProducts');
        }
        
        if(!productId){
            product = Product.find();
        }

        const products = await helperFunc.pagination(req,product);

        if(!products){
            return next(new OperationalError("Product not found",400));
        }

        res.status(200).json({
            status: 'success',
            data:{
                result : products.length,
                products
            }
        })
    }
)

// TODO ::: How to calculate  Top Category

exports.getProductsByCategory= catchAsync(

    async(req,res,next)=>{
        const category = req.query.category;
        if(!category){
            return next(new OperationalError("You must provide a category",402));
        }
        
        let filter;

        if(req.originalUrl.includes('by_specific_category')){
            filter = {"category.specificCat":category}
        }

        if(req.originalUrl.includes('by_generic_category')){
            filter = {"category.genericCat":category}
        }

        const products = await Product.find(filter);
        
        if(!products || products.length === 0){
            return next(new OperationalError("Product(s) not available for this category",400));
        }

        res.status(200).json({
            status: 'success',
            data:{
                totalProduct: products.length,
                products
            }
        })
    }
)