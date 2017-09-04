var express  = require("express"),
    router   = express.Router(),
    passport = require("passport"),
    User     = require("../models/user");

router.get("/", function(req, res){
    res.render("landing");
});

router.get("/about", function(req, res){
   res.render("about"); 
});


router.get("/contact", function(req, res){
   res.render("contact"); 
});

router.get("/pricing", function(req, res){
   res.render("pricing"); 
});

router.get("/paymybill", function(req, res){
   res.render("paymybill"); 
});


router.get("/storagesolutions", function(req, res){
   res.render("storagesolutions"); 
});

// ===================
// AUTH ROUTES
// ===================


//show register form
router.get("/register", function(req, res){
    res.render("blog/register");
});

//handling user sign up
router.post("/register", function(req, res) {
    req.body.username;
    req.body.password;
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("blog/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", user.username + " has been registered");
            res.redirect("/blog");
        });
    });
});

//Login Routes
//render login form
router.get("/login", function(req, res){
    res.render("blog/login");
});

//Login Logic
//middleware
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/blog",
        failureRedirect: "/login",
    }), function(req, res) {
        req.flash("success", "You've logged in");
    
});

//logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("error", "You've logged out");
    res.redirect("/blog");
});

module.exports = router;