const mongoose = require('mongoose')
const db = require('./db');
const Product = require('./Product.js')

// Define Customer Schema
const customerSchema = new mongoose.Schema({
    username: {
        type: String,
        maxlength: 15,
        minlength: 8,
        match: /^[a-zA-Z0-9]+$*/,
        unique: true,
        required: true
    },
    password: {
        type: String,
        minlength: 8,
        maxlength: 15,
        match: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]*$/,
        required: true
    }, 
    profiePicture: {
        type: String
    }, 
    name: {
        type: String,
        minlength: 5,
        required: true
    },
    cart: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Product'
    }]
})

// Define Customer Model
const Customer = db.model('Customer', customerSchema);

// Export Customer Model
module.exports = Customer;