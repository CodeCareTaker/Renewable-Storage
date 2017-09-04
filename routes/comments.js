var express    = require("express"),
    router     = express.Router({mergeParams: true}),
    Blog       = require("../models/blog"),
    Comment    = require("../models/comment"),
    middleware = require("../middleware");


// ===================
// COMMENTS ROUTES
// ===================

router.get("/blog/:id/comments/new", function(req, res){
    //find blog entry by id
    Blog.findById(req.params.id, function(err, blog){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {blog: blog});
        }
    });
});

router.post("/blog/:id/comments/", middleware.isLoggedIn, function(req, res){
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
         });
            console.log(req.body.comment);
        }
    });
});

//Comment Edit
router.get("/blog/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err){
            res.redirect("back");
        } else {
            res.render("comments/edit", {blog_id: req.params.id, comment: foundComment});
        }
    });
});

//Comment Update
router.put("/blog/:id/comments/:comment_id", middleware.checkCommentOwnership,  function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment update sucessful");
            res.redirect("back");
        }
    });
});

//Comment Destroy Route
router.delete("/blog/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment has sucessfully been deleted");
            res.redirect("/blog/" + req.params.id);
        }
    });
});