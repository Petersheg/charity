const express = require('express');
const {upload}= require('../middlewares/multer');
const {authorize} = require('../middlewares/authorize');
const {secureRoute} = require('../middlewares/secureRoute');
const userAuth = require('../controller/authentication/userAuth');
const uploadCon = require('../controller/uploads/uploadDP');
const {upgradeToMerchant} = require('../controller/user/upgradeToMerchant');
const review = require('../controller/user/review');
const {favorite} = require('../controller/user/favoriteItems');
const {saved} = require('../controller/user/saveItems');
const oauth = require('../controller/authentication/oAuth/main');


const router = express.Router();

router.post('/login',userAuth.login);
router.post('/signup',userAuth.userSignUp);
router.post('/oauth/google',oauth.googleOAuth2);

router.post('/forgot_password',userAuth.forgotPassword);
router.patch('/verify_email/:oneTimeToken',userAuth.verifyEmail);
router.post('/reset_password/:oneTimeToken',userAuth.resetPassword);

router.post('/profile_picture',secureRoute, upload.single('profilePic'),uploadCon.uploadDP);
router.get('/profile_picture',secureRoute,uploadCon.getDP);

router.post('/:userId/update_self',secureRoute,authorize('user'),userAuth.updateSelf);
router.post('/:userId/update_password',secureRoute,authorize('user'),userAuth.updatePassword);
router.post('/:userId/upgrade_to_merchant',secureRoute,authorize('user'),upgradeToMerchant);

router.post('/:productId/add_review',secureRoute,authorize('user'),review.addReview);
router.get('/:productId/get_reviews',secureRoute,authorize('user'),review.getProductReviews);

router.post('/:productId/add_to_save',secureRoute,authorize('user'),saved);
router.post('/:productId/add_to_favorite',secureRoute,authorize('user'),favorite);

module.exports = router;