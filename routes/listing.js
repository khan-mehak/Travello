const express = require('express')
const router = express.Router()
const Listing = require('../models/listing.js')
const wrapAsync = require('../utils/wrapAsync.js')
const ExpressError = require('../utils/ExpressError.js')
const { listingSchema } = require('../schema.js')


//validation handling middleware
const validateListing = ((req, res, next) => {
    let { error } = listingSchema.validate(req.body)
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",")
        console.log(error)
        throw new ExpressError(400, errMsg)
    }
    else {
        next()
    }
})

router.get('/', wrapAsync(async (req, res) => {
    const allListings = await Listing.find()
    res.render('listings/index.ejs', { allListings })

}))


//new or create route
router.get('/new', (req, res) => {
    res.render('listings/new.ejs')
})

//Show route
router.get('/:id', wrapAsync(async (req, res) => {
    let { id } = req.params
    const listing = await Listing.findById(id).populate("reviews")
    res.render('listings/show.ejs', { listing })
}))


router.post('/', validateListing, wrapAsync(async (req, res) => {
    console.log("Body received: ", req.body); // Logs incoming data

    // const result = listingSchema.validate(req.body);
    // console.log(result)
    // if (result.error) {
    //     throw new ExpressError(400, result.error);
    // }

    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect('/listings');
}));





//edit and update

router.get('/:id/edit', wrapAsync(async (req, res) => {
    let { id } = req.params
    const listing = await Listing.findById(id)
    res.render("listings/edit.ejs", { listing })
}))

// update route
router.put('/:id', validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params
    await Listing.findByIdAndUpdate(id, { ...req.body.listing })
    res.redirect(`/listings/${id}`)
}))



// delete
router.delete('/:id', wrapAsync(async (req, res) => {
    let { id } = req.params
    const del = await Listing.findByIdAndDelete(id)
    console.log(del)
    res.redirect('/listings')
}))


module.exports=router