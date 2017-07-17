var express  = require("express"),
    router   = express.Router(),
    passport = require("passport"),
    User     = require("../models/user");

router.get("/", function(req, res){
    res.render("landing");
});


// ===================
// AUTH ROUTES
// ===================

//show register form
router.get("/register", function(req, res){
    res.render("register");
})

//handling user sign in
router.post("/register", function(req, res) {
    req.body.username
    req.body.password
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.render('register');
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Yelpcamp " + user.username);
            res.redirect("/campgrounds");
        })
    })
})

//Login Routes
//render login form
router.get("/login", function(req, res){
    
    res.render("login");
});

//Login Logic
//middleware
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
    }), function(req, res) {
    
});

//logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("error", "Logged you out!");
    res.redirect("/campgrounds");
});

module.exports = router;