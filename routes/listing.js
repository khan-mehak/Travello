const express = require('express')
const router = express.Router()
const wrapAsync = require('../utils/wrapAsync.js')
const {isLoggedIn,isOwner,validateListing}=require('../utils/middleware.js')
const listing=require('../controllers/listing.js')
const multer=require('multer')
const {storage}=require('../cloudConfig.js')
// const upload=multer({dest:'uploads/'})
const upload=multer({storage})

router.route('/')
 .get(wrapAsync(listing.index))
 .post(isLoggedIn,
    upload.single("listing[image]"),   
    validateListing, 
    wrapAsync(listing.createListing))

 // .post(upload.single("listing[image]"),
// (req,res)=>{
//     res.send(req.file)
//})


router.get('/new', isLoggedIn ,listing.renderNewForm)


router.route('/:id')
.get(wrapAsync(listing.showListing))
.put(isLoggedIn, isOwner,upload.single("listing[image]"), validateListing, wrapAsync(listing.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listing.deleteListing))

router.get('/:id/edit',isLoggedIn,isOwner, wrapAsync(listing.editListing))

module.exports=router