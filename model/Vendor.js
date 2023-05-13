const mongoose = require('mongoose');
const Product = require('./Product');

// Define Vendor Schema
const vendorSchema = new mongoose.Schema({
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
    businessName: {
        type: String,
        required: true,
        minlength: 5
    },
    bussinessAddress: {
        type: String,
        required: true,
        minlength: 5
    },
    allProduct: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Product'
    }]
});

// Define Vendor Model
const Vendor = mongoose.model('Vendor', vendorSchema);

// Export Vendor Model
module.exports = Vendor;