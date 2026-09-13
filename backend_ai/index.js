require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

const path = require('path');

require('./conn');
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}));

const UserRoutes = require('./Routes/user');
const ResumeRoutes = require('./Routes/resume');

app.use('/api/user',UserRoutes)
app.use('/api/resume',ResumeRoutes)


// Serve static files from the Vite frontend dist folder
const frontendPath = path.resolve(__dirname, '../mern_ai/dist');
app.use(express.static(frontendPath));

// Catch-all route: send index.html for React Router (SPA routing)
// Use middleware form (no path pattern) to avoid path-to-regexp parsing issues in Express 5.x
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT,()=>{
    console.log("backend is running on port",PORT)
})