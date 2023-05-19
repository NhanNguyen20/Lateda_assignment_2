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

const mongoose = require('mongoose');
const db = require('./db');
const Vendor = require('./Vendor')

// Define Product Schema 
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    image: {type: String},
    description: {
        type: String,
        required: true,
        maxlength: 500
    },
    category: {
        type: String,
        enum: ['beauty', 'electronic', 'women', 'men']
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Vendor'
    }
})

// Define Product Model
const Product = db.model('Product', productSchema)

// Export Product Module
module.exports = Product;