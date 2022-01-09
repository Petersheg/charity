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
router.post('/add_admin',secureRoute,authorize('super admin'),userCon.registerAdmin);
router.post('/:Id/edit_admin_details',secureRoute,authorize('super admin','admin'),userCon.editAdminDetails);
router.post('/:userId/toggle_admin_account',secureRoute,authorize('super admin','admin'),userCon.toggleAccount);


module.exports = router;