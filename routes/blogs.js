var express    = require("express");
var router     = express.Router();
var Blog       = require("../models/blog");
var middleware = require("../middleware");

//INDEX - show all blogs in descending(latest) order. Default option
router.get("/", function(req, res){
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
router.get("Asc/", function(req, res){
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
router.get("Alpha/", function(req, res){
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
router.get("AlphaDesc/", function(req, res){
    //Get all blogs from DB
    Blog.find().sort({title: -1}).exec(function(err, allBlogs){
        if(err){
            console.log(err);
        } else {
            res.render("blog/index",{blogs: allBlogs}); 
        }
    });
});

//NEW - show form to create new blog
router.get("/new", middleware.isAdmin, function(req, res){
   res.render("blog/new"); 
});


//CREATE - Add new blog to database
router.post("/", middleware.isAdmin, function(req, res){
    // get data from form and add to blogs array
    var title = req.body.title;
    var image = req.body.image;
    var content  = req.body.content;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newBlog = {title: title, image: image, content: content, author: author};
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
router.get("/:id", function(req, res) {
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
router.get("/:id/edit", middleware.isAdmin, function(req, res){
    Blog.findById(req.params.id, function(err, editBlog) {
        if(err){
            res.render("blog");
        } else {
            res.render("blog/edit", {blog: editBlog});
        }
    });
});


//Update the blog using the info from edit
router.put("/:id", middleware.isAdmin, function(req, res){
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

//Delete a blog entry
router.delete("/:id", middleware.isAdmin, function(req, res) {
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

module.exports = router;