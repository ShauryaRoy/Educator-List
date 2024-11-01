const mongoose = require("mongoose")


const commentSchema = new mongoose.Schema({
    text: String,
    author: String,
    date: { type: Date, default: Date.now }
})

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true,
        trim: true
    },
    comments: [commentSchema]
})

const Teacher = mongoose.model('Teacher', teacherSchema)
module.exports = Teacher;