const express = require('express');
const productCon = require('../controller/product/productCon');
const {secureRoute} = require('../middlewares/secureRoute');

const router = express.Router();
router.get('/get_product/:productId?',secureRoute,productCon.getProduct);
router.get('/by_specific_category',secureRoute,productCon.getProductsByCategory);
router.get('/by_generic_category',secureRoute,productCon.getProductsByCategory);

module.exports = router;