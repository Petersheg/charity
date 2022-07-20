const express = require('express');
const {upload}= require('../middlewares/multer');
const {authorize} = require('../middlewares/authorize');
const {secureRoute} = require('../middlewares/secureRoute');
const userAuth = require('../controller/authentication/userAuth');
const uploadCon = require('../controller/uploads/uploadDP');
const oauth = require('../controller/authentication/oAuth/main');


const router = express.Router();

router.post('/login',userAuth.login);
router.post('/signup',userAuth.userSignUp);
router.post('/oauth/google',oauth.googleOAuth2);
router.post('/oauth/facebook',oauth.googleOAuth2);

router.post('/forgot_password',userAuth.forgotPassword);
router.patch('/verify_email/:oneTimeToken',userAuth.verifyEmail);
router.post('/reset_password/:oneTimeToken',userAuth.resetPassword);

router.post('/profile_picture',secureRoute, upload.single('profilePic'),uploadCon.uploadDP);
router.get('/profile_picture',secureRoute,uploadCon.getDP);

router.post('/:userId/update_self',secureRoute,authorize('user'),userAuth.updateSelf);
router.post('/:userId/update_password',secureRoute,authorize('user','admin'),userAuth.updatePassword);

module.exports = router;