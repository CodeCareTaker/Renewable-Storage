var express               = require("express"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    methodOverride        = require("method-override"),
    flash                 = require("connect-flash"),
    Blog                  = require("./models/blog"),
    Comment               = require("./models/comment"),
    User                  = require("./models/user"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose")
    //seedDB                = require("./seeds")

mongoose.connect("mongodb://localhost/renewable_v2");

var app = express();
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

//===============
// ROUTES
//===============

app.get("/", function(req, res){
    res.render("landing");
});

//INDEX - show all blogs in descending(latest) order. Default option
app.get("/blog", function(req, res){
    //Get all blogs from DB
    Blog.find().sort({created: -1}).exec(function(err, allBlogs){
        if(err){
            console.log(err);
        } else {
            res.render("blog/index",{blogs: allBlogs}); 
        }
    });
});

//INDEX - show all blogs in ascending(oldest) order
app.get("/blogAsc", function(req, res){
    //Get all blogs from DB
    Blog.find().sort({created: 1}).exec(function(err, allBlogs){
        if(err){
            console.log(err);
        } else {
            res.render("blog/index",{blogs: allBlogs}); 
        }
    });
});

//INDEX - Sort all blogs by A-Z
app.get("/blogAlpha", function(req, res){
    //Get all blogs from DB
    Blog.find().sort({title: 1}).exec(function(err, allBlogs){
        if(err){
            console.log(err);
        } else {
            res.render("blog/index",{blogs: allBlogs}); 
        }
    });
});

//INDEX - Sort blogs by Z-A
app.get("/blogAlphaDesc", function(req, res){
    //Get all blogs from DB
    Blog.find().sort({title: -1}).exec(function(err, allBlogs){
        if(err){
            console.log(err);
        } else {
            res.render("blog/index",{blogs: allBlogs}); 
        }
    });
});

app.get("/about", function(req, res){
   res.render("about"); 
});


app.get("/contact", function(req, res){
   res.render("contact"); 
});

app.get("/pricing", function(req, res){
   res.render("pricing"); 
});

app.get("/paymybill", function(req, res){
   res.render("paymybill"); 
});

// app.get("/storagecalculator", function(req, res){
//   res.render("storagecalc"); 
// });

app.get("/storagesolutions", function(req, res){
   res.render("storagesolutions"); 
});

//Auth Routes

//show register form
app.get("/register", function(req, res){
    res.render("blog/register");
})

//handling user sign up
app.post("/register", function(req, res) {
    req.body.username
    req.body.password
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("blog/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", user.username + " has been registered");
            res.redirect("/blog");
        })
    })
})

//Login Routes
//render login form
app.get("/login", function(req, res){
    res.render("blog/login");
});

//Login Logic
//middleware
app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/blog",
        failureRedirect: "/login",
    }), function(req, res) {
        req.flash("success", "You've logged in");
    
});

//NEW - show form to create new blog
app.get("/blog/new", isAdmin, function(req, res){
   res.render("blog/new"); 
});


//CREATE - Add new blog to database
app.post("/blog", isAdmin, function(req, res){
    // get data from form and add to blogs array
    var title = req.body.title;
    var image = req.body.image;
    var content  = req.body.content;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newBlog = {title: title, image: image, content: content, author: author}
    // Create a new blog and save to DB
    Blog.create(newBlog, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            req.flash("success", "Blog entry has been posted");
            //redirect back to blogs page
            res.redirect("/blog");
        }
    });
});

//SHOW - Show a blog entry
app.get("/blog/:id", function(req, res) {
    //find the blog with provided ID
    Blog.findById(req.params.id).populate("comments").exec(function(err, foundBlog){
        if(err){
            console.log(err);
        } else {
            console.log(foundBlog);
            //render show template with that blog
            res.render("blog/show", {blog: foundBlog});
        }
    });
});

//Edit a blog entry
app.get("/blog/:id/edit", isAdmin, function(req, res){
    Blog.findById(req.params.id, function(err, editBlog) {
        if(err){
            res.render("blog");
        } else {
            res.render("blog/edit", {blog: editBlog});
        }
    });
});


//Update the blog using the info from edit
app.put("/blog/:id", isAdmin, function(req, res){
    //update blog information
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updateBlog){
        if(err) {
            req.flash("error", "Blog entry has not been updated");
            res.redirect("blog");
        } else {
            req.flash("success", "Blog entry updated");
            res.redirect("/blog/" + req.params.id);
        }
    });
});

//Unfinished
//Delete a blog entry
app.delete("/blog/:id", isAdmin, function(req, res) {
    //remove blog entry from the website
    Blog.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            req.flash("error", "Deletion unsuccessful");
            res.redirect("/blog");
        } else {
            req.flash("error", "Blog entry deleted");
            res.redirect("/blog");
        }
    });
});

// ===================
// COMMENTS ROUTES
// ===================

app.get("/blog/:id/comments/new", function(req, res){
    //find blog entry by id
    Blog.findById(req.params.id, function(err, blog){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {blog: blog});
        }
    });
});

app.post("/blog/:id/comments/", isLoggedIn, function(req, res){
    //find blog entry by id
    Blog.findById(req.params.id, function(err, blog){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            res.redirect("blog");
        } else {
         //If blog entry is found, post comment
         Comment.create(req.body.comment, function(err, comment){
             if(err){
                 req.flash("error", err.message);
             } else {
                 //add username and id to comment
                 comment.author.id = req.user._id;
                 comment.author.username = req.user.username;
                 //save comment
                 comment.save();
                 blog.comments.push(comment);
                 blog.save();
                 console.log(comment);
                 req.flash("success", "Your comment has been posted");
                 res.redirect("/blog/" + req.params.id);
             }
         })
            console.log(req.body.comment);
        }
    })
});




//Comment Edit
app.get("/blog/:id/comments/:comment_id/edit", checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err){
            res.redirect("back");
        } else {
            res.render("comments/edit", {blog_id: req.params.id, comment: foundComment});
        }
    });
});

//Comment Update
app.put("/blog/:id/comments/:comment_id", checkCommentOwnership,  function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment update sucessful");
            res.redirect("back");
        }
    })
})

//Comment Destroy Route
app.delete("/blog/:id/comments/:comment_id", checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment has sucessfully been deleted");
            res.redirect("/blog/" + req.params.id);
        }
    });
});




//logout route
app.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "You've logged out");
    res.redirect("/blog");
});

//An Account will be required to comment
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//Only an adminstrator can post, edit or delete a blog entry.
//They may also edit, or delete any comment
function isAdmin(req, res, next){
    if(req.user && req.user.isAdmin == true){
        return next();
    } 
    res.redirect("/login");
}

//Checks to see if user has permission to edit selected comment
function checkCommentOwnership (req, res, next){
    if(req.isAuthenticated()) {
            Comment.findById(req.params.comment_id, function(err, foundComment) {
                if(err){
                    req.flash("error", "Comment not found");
                    res.render("/blog");
                } else {
                    // did the user post the comment?
                  if(foundComment.author.id.equals(req.user._id)) {
                    next();
                  //if that fails, checks if the user is an admin
                  } else if(req.user && req.user.isAdmin == true){
                    return next();
                  //if both checks fail then user is denied access
                  } else {
                    req.flash("error", "You are not authorized to edit this comment");
                    res.redirect("back");
                  }
                }
            });
    } else {
        req.flash("error", "You must login to edit a comment");
        res.redirect("back");
    }
}

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The Server Has Started");
});




