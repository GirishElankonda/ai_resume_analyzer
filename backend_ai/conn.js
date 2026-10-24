const mongoose = require('mongoose');


mongoose.connect(process.env.MONGODB_URI).then((res)=>{
    console.log("Database Connected Successfully");
}).catch(err=>{
    console.log("Something Error",err);
})