const express = require('express');
const userAuth = require('../controller/authentication/userAuth');
const router = express.Router();

router.post('/login',userAuth.login);
router.post('/signup',userAuth.userSignUp);

router.post('/forgot_password',userAuth.forgotPassword);
router.patch('/verify_email/:oneTimeToken',userAuth.verifyEmail);
router.post('/reset_password/:oneTimeToken',userAuth.resetPassword);


module.exports = router;