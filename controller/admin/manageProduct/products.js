const catchAsync = require("../../../utility/catchAsync");
const OperationalError = require("../../../utility/operationalError");
const Product = require("../../../model/product/product");
const DealOfTheDay = require('../../../model/product/dealOfTheDay');
const reuse = require('../../general/reuse');

exports.respondToDealOfTheDay = catchAsync(
    async(req,res,next)=>{
        const productId = req.params.Id;
        const productFromDOD = await DealOfTheDay.findOne({product : productId});

        if(!productFromDOD){
            return next(new OperationalError('Product do not exist in deal',404));
        }

        const {decision} = req.body;
        if(!decision || decision === ''){
            return next(new OperationalError('decision is required',400));
        }

        const acceptableArr = ['accept','decline'];
        const acceptable = acceptableArr.some((value)=> decision === value);

        if(!acceptable){
            return next(new OperationalError('you have provided an unacceptable decision',400));
        }

        if(productFromDOD.accept && decision === 'accept' || productFromDOD.decline && decision === 'decline'){
            return next(new OperationalError('you already made same decision',400));
        }

        if(decision === 'accept'){
            productFromDOD.status = 'accept';
            productFromDOD.accept = true;
            productFromDOD.dateAccepted = Date.now();
            productFromDOD.validTill = Date.now() + 96 * 60 * 60 * 1000 //for 4 days validity;

            productFromDOD.decline = undefined;
            productFromDOD.dateDeclined = undefined;
        }

        if(decision === 'decline'){
            productFromDOD.status = 'decline';
            productFromDOD.decline = true;
            productFromDOD.dateDeclined = Date.now();

            productFromDOD.accept = undefined;
            productFromDOD.dateAccepted = undefined;
        }
        await productFromDOD.save();
        
        res.status(200).json({
            status : 'success',
            message : 'decision successfully updated',
            deal : productFromDOD
        })
    }  
);

exports.deleteDOD = catchAsync(
    async (req,res,next)=>{
        await reuse.deleteController(req,res,next,"deal",DealOfTheDay);
    }
)

exports.deleteProduct = catchAsync(
    async(req,res,next)=>{
        await reuse.deleteController(req,res,next,"product",Product);
    }
);