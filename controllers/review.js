const Review = require('../models/review.js')
const Listing = require('../models/listing.js')


module.exports.createReview=async(req,res)=>{
    let {id}=req.params
    let listing=await Listing.findById(id)

    let newReview= new Review(req.body.review)
    newReview.author=req.user._id
    console.log(newReview)
    listing.reviews.push(newReview)

    await newReview.save()
    await listing.save()

    console.log("reveiew saved")
     req.flash("success","New Review added successfully!")
    res.redirect(`/listings/${id}`)
}


module.exports.deleteReview=async(req,res)=>{
           let{id,reviewId}=req.params
           await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
           await Review.findByIdAndDelete(reviewId)
           req.flash("success","Review deleted")
           res.redirect(`/listings/${id}`)
}