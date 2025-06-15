if(process.env.NODE_ENV!='production'){
    require("dotenv").config()
}

const express=require('express')
const app=express()
const mongoose=require('mongoose')
const path=require('path')
const methodOverride=require('method-override')
const ejsMate=require('ejs-mate')
const listingRouter=require('./routes/listing.js')
const reviewRouter=require('./routes/review.js')
const userRouter=require('./routes/user.js')

const session=require('express-session')
const mongostore=require('connect-mongo')
const flash=require('connect-flash')

const passport=require('passport')
const LocalStrategy=require('passport-local')
const User=require('./models/user.js')


let url=process.env.MONGO_URL

const store=mongostore.create({
    mongoUrl:url,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter:24*3600
})


store.on("error",(err)=>{
    console.log("Error in Mongo session store",err)
})

const sessionOpt={
    store:store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    }
}




app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"))
app.engine('ejs',ejsMate)
app.use(express.static(path.join(__dirname,"/public")))
app.use(session(sessionOpt))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())



//home route

app.use((req,res,next)=>{
    res.locals.success=req.flash("success")
    res.locals.error=req.flash("error")
    res.locals.currUser=req.user
    next()
})


// app.get('/',(req,res)=>{
//     res.send("Hello Project")
// })

// app.get('/demouser',async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"student"

//     })

//     let registerUser=await User.register(fakeUser,"pass123")
//     res.send(registerUser)
// })



app.use('/listings',listingRouter)

app.use('/listings/:id/reviews',reviewRouter)

app.use('/',userRouter)


//error handling middleware
app.use((err, req, res, next) => {
    let{status=500,message="Something went wrong"}=err
    res.status(status).render("error.ejs",{err})
   
});




main().then(()=>{
    console.log("Connected to MongoDb database successfully")
})
.catch((err)=>{
    console.log("Error connecting database",err)
})


async function main(){
    await mongoose.connect(url)
}


app.listen(8080,()=>{
    console.log("Server is running on port : 8080")
})
