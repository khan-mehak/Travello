const express=require('express')
const app=express()
const mongoose=require('mongoose')
const path=require('path')
const methodOverride=require('method-override')
const ejsMate=require('ejs-mate')
const listings=require('./routes/listing.js')
const reviews=require('./routes/review.js')


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

//home route
app.get('/',(req,res)=>{
    res.send("Hello Project")
})

app.use('/listings',listings)

app.use('/listings/:id/reviews',reviews)


//error handling middleware
app.use((err, req, res, next) => {
    let{status=500,message="Something went wrong"}=err
    res.status(status).render("error.ejs",{err})
   
});


app.listen(8080,()=>{
    console.log("Server is running on port : 8080")
})
