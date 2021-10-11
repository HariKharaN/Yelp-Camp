if(process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}



// console.log(process.env.CLOUDINARY_KEY);
// Libraries and utils
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError')
const methodOverride = require("method-override");
const ejsMate= require('ejs-mate');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const session = require('express-session');
const MongoDBStore = require('connect-mongo');




// Individual routes for clean code
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/review');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// Database part
mongoose.connect(dbUrl,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection; 
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();
app.engine('ejs',ejsMate)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [
  "https://fonts.gstatic.com",
  "https://fonts.google.com/"
];
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/djcmedreb/", //CLOUDINARY NAME! 
              "https://images.unsplash.com/",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);

const secret = process.env.SECRET || 'thisshouldbeabettersecret';
const store = MongoDBStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60
});
// Session part
const sessionConfig = {
  store,
  name:'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie:{
    httpOnly : true,
    // secure:true,
    expires: Date.now() + 1000*60*60*24*7,
    maxAge:1000*60*60*24*7,
  }
}
app.use(session(sessionConfig));
app.use(flash());

// passport library part
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// FLASH MESSAGES
app.use((req,res,next) =>{
  console.log(req.session);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

// ROUTES SIMPLIFIED
app.use('/',userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/',(req,res,next) =>{
  res.render('home')
})
// default route
app.all('*',(req,res,next) =>{
  
  next(new ExpressError('Page Not Found',404))
})

// error handling 
app.use((err,req,res,next) =>{
  const {statusCode = 500 }=  err;
  if(!err.message) err.message = 'Oh! No something went wrong!'
  res.status(statusCode).render('error',{err});
})

// listening port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`SERVING on port : ${port}`);
});


