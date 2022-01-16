const catchAsync = require("../../utility/catchAsync");
const Product = require('../../model/product/product');
const OperationalError = require('../../utility/operationalError');
const DealOfTheDay = require('../../model/product/dealOfTheDay');

exports.addDealOfTheDay = catchAsync(
    async(req,res,next)=>{

        const productId = req.params.productId;
        const product = await Product.findById(productId);

        if(!productId){
            return next(new OperationalError('product Id is required',400))
        }

        if(!product) {
            return next(new OperationalError('product not found',404));
        }

        if(String(product.merchant) !== String(req.user._id)){
            return next(new OperationalError('You can only add a product that belongs to you!',406))
        }

        const productCheck = await DealOfTheDay.findOne({product:productId});

        if(String(productCheck?.product) === productId ){
            return next(new OperationalError('You a!ready added this product',400));

        }
        const deal = await DealOfTheDay.create({
            status : 'pending',
            dateAdded : Date.now()
        })
        deal.user = req.user._id;
        deal.product = productId;
        await deal.save();

        // if we have to restrict merchant to a specific number of products to added
        const allUserDOD = await DealOfTheDay.countDocuments({user : req.user._id});
    
        res.status(200).json({
            status: 'success',
            message: `Product added successfully, kindly wait for approval`,
            data:{
                items : deal
            }
        })
    }
);

exports.removeDealOfTheDay = catchAsync(
    async(req,res,next)=>{
        const productId = req.params.productId;
        const productDelete = await DealOfTheDay.findOneAndDelete({product : productId});

        if(!productDelete){
            return next(new OperationalError('Product you are trying to remove does not exist in Deal',400));
        }

        res.status(200).json({
            status : 'success',
            message : 'product removed successfully'
        })
    }
);

exports.getDOD = catchAsync(

    async(req,res,next)=>{
        const merchantId = req.params.userId;

        let filter;
        // fetch DealOfTheDay with query
        if(req.query){
            filter = {...req.query}
        }

        // fetch DealOfTheDay with MerchantId
        if(req.originalUrl.includes('/get_deals_by_merchant') && merchantId){
            filter = {user: merchantId};
        }

        // fetch DealOfTheDay with MerchantId and query
        if(req.originalUrl.includes('/get_deals_by_merchant') && merchantId && req.query){
            filter = {user: merchantId, ...req.query};
        }
        let merchantsDeals = await DealOfTheDay.find(filter);

        merchantsDeals.map( deal => {
            deal.checkIfStillValid();
        });

        res.status(200).json({
            status: 'success',
            message: 'deals fetched successfully',
            data:{
                deals: merchantsDeals
            }
        })
    }

);