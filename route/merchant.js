const express = require('express');
const {secureRoute} = require('../middlewares/secureRoute');
const {authorize} = require('../middlewares/authorize');
const merchantAuth = require('../controller/authentication/merchantAuth');

const router = express.Router();

router.post('/signup',merchantAuth.signUp);
router.post('/:userId/update_self',secureRoute,authorize('merchant'),merchantAuth.updateSelf);
router.post('/:userId/update_password',secureRoute,authorize('merchant'),merchantAuth.updatePassword);

module.exports = router;


