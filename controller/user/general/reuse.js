const OperationalError = require('../../../utility/operationalError');
const Product = require('../../../model/product/product');
const helperFunc = require('../../../utility/helperFunc');

exports.storeItems = async (req,res,next,Model)=>{

    const productId = req.params.productId;
    const user = req.user._id;

    const product = await Product.findById(productId);
    if(!product) {
        return next(new OperationalError("Product not found",400));
    }

    // Check if Store already exist for this user
    const store = await Model.findOne({user});

    async function addProductAndSave(store) {
        store.products.push(productId);
        await store.save();

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
        await addProductAndSave(newStore);
    }

    // Check Store if product exist
    const productExist =  await Model.findOne({
        products : {$eq : productId}
    });


    if(store && !productExist){
        await addProductAndSave(store);
    }

    if(store && productExist){
        store.products.pop(productId);
        await store.save();

        res.status(200).json({
            status: 'success',
            message: `Product remove successfully`,
            data:{
                items : store
            }
        })
    }
}

exports.removeItem = async (req,res,next,Model)=>{

    const productId = req.params.productId;
    const user = req.user._id;

    const product = await Product.findById(productId);
    if(!product) {
        return next(new OperationalError("Product not found",400));
    }

    // Check if Store already exist for this user
    const store = await Model.findOne({user});

     // Check Store if product exist
     const productExist =  await Model.findOne({
        products : {$eq : productId}
    });


    if(store && !productExist){
        return next(new OperationalError("Product you are trying to remove does not exist",400));
    }

    if(store && productExist){
        store.products.pop(productId);
        await store.save();

        res.status(200).json({
            status: 'success',
            message: `Product remove successfully`,
            data:{
                items : store
            }
        })
    }
}

exports.getItems = async (req,res,next,Model)=>{
    
    const user = req.user._id;

    // Check if Store already exist for this user
    const store = await Model.findOne({user}).populate({
        path:'products',
        select:'-similarProducts'
    });

    if(!store|| store.products.length === 0){
        return next(new OperationalError("You do not have any item(s) in here",400));
    }
    
    let products = store.products;
    res.status(200).json({
        status: 'success',
        message: `Item(s) fetched`,
        data:{
            products
        }
    })
}