require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./conn');

const app = express();

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));

app.use('/api', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('Database connection failed:', error.message);
        res.status(503).json({ error: 'Database unavailable' });
    }
});

const UserRoutes = require('./Routes/user');
const ResumeRoutes = require('./Routes/resume');

app.use('/api/user', UserRoutes);
app.use('/api/resume', ResumeRoutes);

module.exports = app;