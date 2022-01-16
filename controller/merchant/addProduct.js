const Product = require('../../model/product/product');
const OperationalError = require('../../utility/operationalError');
const catchAsync = require('../../utility/catchAsync');

exports.addProduct = catchAsync(

    async(req,res,next)=>{

        const merchantId = req.params.userId;

        if(req.user.id != merchantId){
            return next(new OperationalError("user not found",404))
        }

        const {
            genericCat,specificCat,
            productPrice,discount,
            productTags,sku,
            lowStockThreshold, quantity
        } = req.body;

        const product = new Product(req.body);
        
        product.category = {genericCat,specificCat};
        product.inventory = {sku,lowStockThreshold,quantity}
        product.inventory.inStock = product.checkAvailability();

        if(discount){

            if(discount >= productPrice){
                return next(new OperationalError("discount must be less than actual price",400))
            }
            product.price = {productPrice,discount};
            product.price.offPercentage = product.calcOffPercent();
        }

        if(!discount){
            product.price = {productPrice};
        }

        const tags = productTags.split(',');

        if(tags.length < 4){
            return next(new OperationalError("product requires at least 4 tags",400))
        }
        
        tags.map(async(tagName) =>{
            product.newTags.push(tagName);
        })

        product.merchant = merchantId;

        // similar Products
        const productsByCategory = await Product
        .find({"category.specificCat": product.category.specificCat})
        .select('merchant productTags');
        product.detectSimilarProducts(productsByCategory);
        
        await product.save();
        const fullDetail = await Product.findById(product._id)
        .populate('merchant','businessName')


        res.status(200).json({
            status: 'success',
            data:{
                product : fullDetail
            }
        })

    }
)