const express = require('express');
const {secureRoute} = require('../middlewares/secureRoute');
const {authorize} = require('../middlewares/authorize');
const merchantAuth = require('../controller/authentication/merchantAuth');
const {addProduct} = require('../controller/merchant/addProduct');
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
router.post('/:Id/edit_product',secureRoute,authorize('merchant'),editProduct);

router.post(
    '/upload_product_image',///:productId
    // secureRoute,authorize('merchant'),
    // upload.single('productImage'),
    upload.array('productImage',6),
    uploadCon.uploadProductIMG
);

module.exports = router;


