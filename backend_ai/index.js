const express = require('express');
const cors = require('cors')
const app = express();
const PORT = 4000;

const path = require('path')

require('./conn');
app.use(express.json());
app.use(cors({
    credentials:true,
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
}))

const UserRoutes = require('./Routes/user');
const ResumeRoutes = require('./Routes/resume');

app.use('/api/user',UserRoutes)
app.use('/api/resume',ResumeRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));


// // Serve static files from the build folder
// app.use(express.static(path.join(__dirname, "build")));

// // Catch-all route: send index.html for React Router
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });

app.listen(PORT,()=>{
    console.log("backend is running on port",PORT)
})