const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DATABASE_URL)
.then(()=>{
    console.log('DB connection successful');
}).catch((err)=>{
    console.log('Unable to connect to DB', err);
})
