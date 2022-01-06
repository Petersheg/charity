const express = require('express');
const {secureRoute} = require('../middlewares/secureRoute');
const {authorize} = require('../middlewares/authorize');
const merchantAuth = require('../controller/authentication/merchantAuth');
const {addProduct} = require('../controller/merchant/addProduct');
const deal = require('../controller/merchant/deal');
const {editProduct} = require('../controller/merchant/editProduct');
const uploadCon = require('../controller/uploads/uploadDP');
const {upload}= require('../middlewares/multer');
const oauth = require('../controller/authentication/oAuth/main');


const router = express.Router();

router.post('/signup',merchantAuth.signUp);
router.post('/oauth/google',oauth.googleOAuth2);
router.post('/:userId/update_self',secureRoute,authorize('merchant'),merchantAuth.updateSelf);
router.post('/:userId/update_password',secureRoute,authorize('merchant'),merchantAuth.updatePassword);

router.post('/:userId/add_product',secureRoute,authorize('merchant'),addProduct);
router.post('/:productId/add_deal_of_the_day',secureRoute,authorize('merchant'),deal.addDealOfTheDay);
router.post('/:productId/remove_deal_of_the_day',secureRoute,authorize('merchant'),deal.removeDealOfTheDay);
router.get('/:userId?/get_deals',secureRoute,authorize('merchant','admin'),deal.getDOD);
router.post('/:Id/edit_product',secureRoute,authorize('merchant'),editProduct);

router.post(
    '/upload_product_image',///:productId
    // secureRoute,authorize('merchant'),
    // upload.single('productImage'),
    upload.array('productImage',6),
    uploadCon.uploadProductIMG
);

module.exports = router;


