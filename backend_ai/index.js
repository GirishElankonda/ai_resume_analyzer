const express = require('express');
const PORT = 4000;
const app = require('./app');
const path = require('path');

const frontendPath = path.resolve(__dirname, '../mern_ai/dist');
app.use(express.static(frontendPath));
app.use((req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT,()=>{
    console.log("backend is running on port",PORT)
})