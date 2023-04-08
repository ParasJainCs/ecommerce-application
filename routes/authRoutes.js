const express = require('express');
const {login, logout, register} = require('../controllers/authController');

const router  = express.Router();
router.route('/logout').get(logout);
router.route('/login').post(login);
router.route('/register').post(register);

module.exports = router;