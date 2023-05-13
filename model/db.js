// this file is used to connect to the database
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://<username>:<password>@cluster0.m0b9fwy.mongodb.net/?retryWrites=true&w=majority')
.then(()=>console.log('Connected to the database')).catch((err)=>console.log(err.message));

// export the connection
module.exports = mongoose.connection;