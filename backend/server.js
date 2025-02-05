import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './db/db.js';
import teacherRoutes from './routes/teachers.routes.js';

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

connectDB();

// Root route
app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

// Teacher routes
app.use('/api/teachers', teacherRoutes);

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
