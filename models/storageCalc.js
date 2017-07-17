var mongoose = require("mongoose")

//SCHEMA SETUP
var storageCalculationSchema = new mongoose.Schema({
    name: String,
    description: String,
    submittedBy:{
             id: {
                 type: mongoose.Schema.Types.ObjectId,
                 ref: "User"
             },
             username: String
    }
});

module.exports = mongoose.model("storageAmount", storageCalculationSchema);