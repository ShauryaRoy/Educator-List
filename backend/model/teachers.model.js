import mongoose from "mongoose"


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
    image_url: {  // Updated to match MongoDB field name
        type: String,
        required: true,
        trim: true
    },
    comments: [commentSchema]
});

const Teacher = mongoose.model('Teacher', teacherSchema, 'teachers');
export default Teacher;