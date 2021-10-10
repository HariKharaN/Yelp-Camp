const express = require("express");
const passport = require("passport");
const router  = express.Router();
const User = require('../models/user');
const {isLoggedIn} = require('../middleware');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users')

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.newRegister));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local',{failureFlash:true, failureRedirect:'/login'}),users.newLogin)

router.get('/logout', users.logout)

module.exports=router;