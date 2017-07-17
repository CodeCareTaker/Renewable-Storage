var Comment    = require("../models/comment");

//all the middleware goes here
var middlewareObj = {};

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

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Login First!");
    res.redirect("/login");
};

module.exports = middlewareObj;

