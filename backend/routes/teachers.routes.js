import express from 'express';
import Teacher from '../model/teachers.model.js';

const router = express.Router();

// Get all teachers
router.get('/', async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get a specific teacher by ID
router.get('/:id', async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Add a comment to a specific teacher
router.post('/:id/comments', async (req, res) => {
    const { text, author } = req.body;
    if (!text || !author) {
        return res.status(400).json({ message: 'Text and author are required' });
    }
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        const newComment = { text, author };
        teacher.comments.push(newComment);
        await teacher.save();

        res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get all comments for a specific teacher
router.get('/:id/comments', async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        res.json(teacher.comments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

export default router;