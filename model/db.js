// RMIT University Vietnam
// Course: COSC2430 Web Programming
// Semester: 2023A
// Assessment: Assignment 2
// Authors: 
// Nguyen Le Thu Nhan - s3932151
// Ong Gia Man - s3938231
// Nguyen Ngoc Minh Thu - s3941327
// Nguyen Tuan Duong - s3965530
// Nguyen Pham Tien Hai - s3979239
// Chau The Kien - s3790421
// Acknowledgement: Acknowledge the resources that you use here.

// This file is used to connect to the database
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://user:mypassword@lateda.iejgaoj.mongodb.net/lateda-database?retryWrites=true&w=majority')
.then(()=>console.log('Connected to the database')).catch((err)=>console.log(err.message));

// export the connection
module.exports = mongoose.connection;