const express = require('express');
const {secureRoute} = require('../middlewares/secureRoute');
const {authorize} = require('../middlewares/authorize');
const userCon = require('../controller/admin/manageUser/user');
const productCon = require('../controller/admin/manageProduct/products');

const router = express.Router();
router.post('/:Id/delete_user',secureRoute,authorize('admin'),userCon.deleteUser);
router.post('/:Id/delete_product',secureRoute,authorize('admin'),productCon.deleteProduct);
router.post('/:Id/delete_deal',secureRoute,authorize('admin'),productCon.deleteDOD);
router.post('/:Id/decide_on_deals',secureRoute,authorize('admin'),productCon.respondToDealOfTheDay);

module.exports = router;