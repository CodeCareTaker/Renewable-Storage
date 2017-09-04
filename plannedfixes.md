Finish separating routes into different filesvar express               = require("express"),
    app                   = express(),
    bodyParser            = require("body-parser"),
    mongoose              = require("mongoose"),
    flash                 = require("connect-flash"),
    passport              = require("passport"),
    methodOverride        = require("method-override"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    Blog                  = require("./models/blog"),
    Comment               = require("./models/comment"),
    User                  = require("./models/user");
    //seedDB                = require("./seeds");
    
//requiring routes
var indexRoutes           = require("./routes/index"),
    commentRoutes         = require("./routes/comments"),
    blogRoutes            = require("./routes/blogs");

//Connect to the database
var url = process.env.DATABASEURL || "mongodb://localhost/renewable_v2";
mongoose.connect(url);


mongoose.Promise = global.Promise;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret:"What is going on?",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//Fills the database with blogs
//seedDB();

app.use("/", indexRoutes);
app.use("/blog", blogRoutes);
app.use("/blog/:id/comments/", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The Server Has Started");
});