const catchAsync = require('../../utility/catchAsync');
const OperationalError = require('../../utility/operationalError');
const Reviews = require('../../model/reviewsModel');
const Product = require('../../model/product/product');
const helperFunc = require('../../utility/helperFunc')

exports.addReview = catchAsync(

    async (req, res, next) =>{
        const productId = req.params.productId;
        const {rating,review} = req.body;
        const user = req.user._id;

        const product = await Product.findById(productId);
        if(!product){
            return next(new OperationalError("Product not found",404));
        }

        const checkForUserInReview = await Reviews.findOne({user});

        if(checkForUserInReview){
            return next(new OperationalError("You already added a review to this product", 406));
        }

        const productReview = await Reviews.create({rating,review,user,product:productId});
        res.status(200).json({
            status: 'success',
            message: 'Review added successfully',
            data:{
                review : productReview
            }
        })
    }
);

exports.getProductReviews = catchAsync(

    async(req,res, next)=>{
        
        const product = req.params.productId;

        let review = Reviews.find({product}).populate('user','userName profilePicture');
        let allReviews = await review;
        const allUsers = allReviews.length;
        
        // Average rating
        let avgRating = allReviews
        .map(review => {
            return review.rating;
        }).reduce((a,b)=>{
            return a + b;
        })/allUsers;

        avgRating = Number(avgRating.toFixed(1));

        // Run pagination on response
        const reviews = await helperFunc.pagination(req,review);
        

        if(!reviews || reviews.length === 0){
            return next(new OperationalError("No review(s) to display", 404));
        }
        
        res.status(200).json({
            status:'success',
            data:{
                totalReviews : allReviews.length,
                avgRating,
                reviews 
            }
        })
    }
);