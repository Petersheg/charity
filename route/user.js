const express = require('express');
const {upload}= require('../middlewares/multer')
const userAuth = require('../controller/authentication/userAuth');
const uploadCon = require('../controller/uploads/uploadDP');
const {secureRoute} = require('../middlewares/secureRoute')


const router = express.Router();

router.post('/login',userAuth.login);
router.post('/signup',userAuth.userSignUp);

router.post('/forgot_password',userAuth.forgotPassword);
router.patch('/verify_email/:oneTimeToken',userAuth.verifyEmail);
router.post('/reset_password/:oneTimeToken',userAuth.resetPassword);

router.post('/profile_picture',secureRoute, upload.single('profilePic'),uploadCon.uploadDP);
router.get('/profile_picture',secureRoute,uploadCon.getDP);
router.post('/:userId/update_self',secureRoute,userAuth.updateSelf);




module.exports = router;