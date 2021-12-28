const OperationalError = require('../../../utility/operationalError');
const Product = require('../../../model/product/product');


exports.storeItems = async (req,res,next,Model)=>{

    const productId = req.params.productId;
    const user = req.user._id;

    const product = await Product.findById(productId);
    if(!product) {
        return next(new OperationalError("Product not found",400));
    }

    // Check if Store already exist for this user
    const store = await Model.findOne({user});

    function addProductAndSave(store) {
        store.products.push(productId);
        store.save();

        res.status(200).json({
            status: 'success',
            message: `Product added successfully`,
            data:{
                items : store
            }
        })
    }

    // If Store does not exist, create a new one and add product
    if(!store){
        const newStore = await Model.create({user});
        addProductAndSave(newStore)
    }

    // Check Store if product exist
    const productExist =  await Model.findOne({
        products : {$eq : productId}
    });


    if(store && !productExist){
        addProductAndSave(store);
    }

    if(store && productExist){
        store.products.pop(productId);
        store.save();

        res.status(200).json({
            status: 'success',
            message: `Product remove successfully`,
            data:{
                items : store
            }
        })
    }
}