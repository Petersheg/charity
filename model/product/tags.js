const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
    
    tagName:{
        type: String,
        required: [true,"tag(s) is required"]
    },

    createdAt:{
        type:Date,
        default: Date.now
    }
});

const Tag = new mongoose.Schema("Tag",tagSchema);
module.exports = Tag