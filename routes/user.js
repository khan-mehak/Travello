const express = require("express");
const router = express.Router();
const wrapAsync=require('../utils/wrapAsync.js')
const passport=require('passport')
const {saveRedirectUrl}=require('../utils/middleware.js')
const user=require('../controllers/user.js')


router.route("/signup")
.get(user.renderSignUp)
.post(wrapAsync(user.signup))


router.route('/login')
.get(user.renderLogin)
.post(saveRedirectUrl,
  passport.authenticate('local',{failureRedirect:'/login',failureFlash:true}), 
  user.login)

router.get('/logout',user.logout)

module.exports = router;
