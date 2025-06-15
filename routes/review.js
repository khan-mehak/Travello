const express = require('express')
const router = express.Router({mergeParams:true})
const wrapAsync = require('../utils/wrapAsync.js')
const {validateReview,isLoggedIn,isAuthor}=require('../utils/middleware.js')
const review=require('../controllers/review.js')


router.post('/',isLoggedIn,validateReview,wrapAsync(review.createReview))


router.delete("/:reviewId",isLoggedIn,isAuthor,wrapAsync(review.deleteReview))



module.exports=router
