// const User = require('../../model/userModel');
const Product = require('../../model/product/product');
// const Category = require('../../model/product/category');
// const Inventory = require('../../model/product/inventory');
// const Price = require('../../model/product/price');
const OperationalError = require('../../utility/operationalError');
const catchAsync = require('../../utility/catchAsync');

exports.addProduct = catchAsync(

    async(req,res,next)=>{

        const merchantId = req.params.userId;

        if(req.user.id != merchantId){
            return next(new OperationalError("user not found",400))
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
        product.price = {productPrice,discount};

        product.price.offPercentage = product.calcOffPercent();

        console.log(product.price.offPercentage);
        console.log(product.calcOffPercent());

        const tags = productTags.split(',');

        if(tags.length < 4){
            return next(new OperationalError("product requires at least 4 tags",400))
        }
        
        tags.map(async(tagName) =>{
            product.newTags.push(tagName);
        })

        product.merchant = merchantId;

        // Save all sub documents
        // await inventory.save();
        // await price.save();

        // remove all temporary fields
        // product.removeTemFields();

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