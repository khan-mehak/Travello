const express=require('express')
const app=express()
const mongoose=require('mongoose')
const Listing=require('./models/listing.js')
const path=require('path')
const methodOverride=require('method-override')
const ejsMate=require('ejs-mate')
const wrapAsync=require('./utils/wrapAsync.js')
const ExpressError=require('./utils/ExpressError.js')
const {listingSchema,reviewSchema}=require('./schema.js')
const Review=require('./models/review.js')


app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"))
app.engine('ejs',ejsMate)
app.use(express.static(path.join(__dirname,"/public")))


let Mongo_URL="mongodb://127.0.0.1:27017/travello"

main().then(()=>{
    console.log("Connected to MongoDb database successfully")
})
.catch((err)=>{
    console.log("Error connecting database",err)
})


async function main(){
    await mongoose.connect(Mongo_URL)
}

//validation handling middleware
const validateListing=((req,res,next)=>{
    let {error}=listingSchema.validate(req.body)
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",")
        console.log(error)
        throw new ExpressError(400,errMsg)
    }
    else{
        next()
    }
})


const validateReview=((req,res,next)=>{
    let {error}=reviewSchema.validate(req.body)
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",")
        console.log(error)
        throw new ExpressError(400,errMsg)
    }
    else{
        next()
    }
})


//home route
app.get('/',(req,res)=>{
    res.send("Hello Project")
})

//index route
app.get('/listings',wrapAsync(async(req,res)=>{
    const allListings=await Listing.find()
    res.render('listings/index.ejs',{allListings})

}))


//new or create route
app.get('/listings/new',(req,res)=>{
    res.render('listings/new.ejs')
})

//Show route
app.get('/listings/:id',wrapAsync(async(req,res)=>{
    let {id}=req.params
    const listing=await Listing.findById(id).populate("reviews")
    res.render('listings/show.ejs',{listing})
}))


//create new listings
// app.post('/listings', wrapAsync(async (req, res) => {
//     // console.log(req.body); // Log the request body here
//     // if (!req.body.listing) {
//     //     throw new ExpressError(404, "Send valid data for listing");
//     // }

//     const result=listingSchema.validate(req.body)
//     console.log(result)
//     if(result.error){
//         throw new ExpressError(404,result.error)
//     }
//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect('/listings');
// }));


app.post('/listings',validateListing, wrapAsync(async (req, res) => {
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

app.get('/listings/:id/edit',wrapAsync(async(req,res)=>{
    let {id}=req.params
    const listing=await Listing.findById(id)
    res.render("listings/edit.ejs",{listing})
}))

// update route
app.put('/listings/:id',validateListing,wrapAsync(async(req,res)=>{
    let {id}=req.params
    await Listing.findByIdAndUpdate(id,{...req.body.listing})
    res.redirect(`/listings/${id}`)
}))



// delete
app.delete('/listings/:id',wrapAsync(async(req,res)=>{
    let {id}=req.params
    const del=await Listing.findByIdAndDelete(id)
    console.log(del)
    res.redirect('/listings')
}))


//review
// post route
app.post('/listings/:id/reviews',validateReview,wrapAsync(async(req,res)=>{
    let {id}=req.params
    let listing=await Listing.findById(id)

    let newReview= new Review(req.body.review)

    listing.reviews.push(newReview)

    await newReview.save()
    await listing.save()

    console.log("reveiew saved")
    res.redirect(`/listings/${id}`)
}))

//Delete review route

app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
           let{id,reviewId}=req.params
           await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
           await Review.findByIdAndDelete(reviewId)
           res.redirect(`/listings/${id}`)
}))




//error handling middleware
app.use((err, req, res, next) => {
    let{status=500,message="Something went wrong"}=err
    res.status(status).render("error.ejs",{err})
   
});


app.listen(8080,()=>{
    console.log("Server is running on port : 8080")
})
