const express = require('express');
const {upload}= require('../middlewares/multer');
const {authorize} = require('../middlewares/authorize');
const userAuth = require('../controller/authentication/userAuth');
const uploadCon = require('../controller/uploads/uploadDP');
const {secureRoute} = require('../middlewares/secureRoute');
const {upgradeToMerchant} = require('../controller/user/upgradeToMerchant');
const review = require('../controller/user/review');


const router = express.Router();

router.post('/login',userAuth.login);
router.post('/signup',userAuth.userSignUp);

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


module.exports = router;