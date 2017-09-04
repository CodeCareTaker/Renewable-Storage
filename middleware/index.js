var Blog       = require("../models/blog");
var Comment    = require("../models/comment");

//all the middleware goes here
var middlewareObj = {};

//Checks to see if user has permission to edit selected comment
middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()) {
            Comment.findById(req.params.comment_id, function(err, foundComment) {
                if(err){
                    req.flash("error", "Comment not found");
                    res.render("/campgrounds");
                } else {
                    // does user own the comment?
                    if(foundComment.author.id.equals(req.user._id)) {
                        next();
                    } else {
                        req.flash("error", "You are not authorized to edit this comment")
                        res.redirect("back");
                    }
                }
            });
        } else {
            req.flash("", "You must login to edit a comment");
            res.redirect("back");
        }
}

//Only an adminstrator can post, edit or delete a blog entry.
//They may also edit, or delete any comment
function isAdmin(req, res, next){
    if(req.user && req.user.isAdmin == true){
        return next();
    } 
    res.redirect("/login");
}

//this method checks that the user has logged into an account before allowing them to post, edit, or delete comments
middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Login First!");
    res.redirect("/login");
};

module.exports = middlewareObj;

