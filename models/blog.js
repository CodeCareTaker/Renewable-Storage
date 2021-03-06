var mongoose = require("mongoose")

//SCHEMA SETUP
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    content: String,
    created: { 
        type: Date, 
        default: Date.now
    },
    author: {
             id: {
                 type: mongoose.Schema.Types.ObjectId,
                 ref: "User"
             },
             username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

module.exports = mongoose.model("Blog", blogSchema);