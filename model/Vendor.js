const mongoose = require('mongoose');
const db = require('./db');
const Product = require('./Product');
const Customer = require('./Customer');
const Shipper = require('./Shipper');

// Define Vendor Schema
const vendorSchema = new mongoose.Schema({
    username: {
        type: String,
        maxlength: 15,
        minlength: 8,
        match: /^[a-zA-Z0-9]+$/,
        unique: true,
        required: true,
        validate: {
            validator: async function(value) {
                const vendor = await this.constructor.findOne({username: value});
                const shipper = await mongoose.model('Shipper').findOne({username: value});
                const customer = await mongoose.model('Customer').findOne({username: value});
                if (vendor || shipper || customer) {
                    return false;
                }   return true;
            }
        }
    },
    password: {
        type: String,
        minlength: 8,
        maxlength: 15,
        match: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]*$/,
        required: true
    }, 
    profilePicture: {
        type: String
    },
    businessName: {
        type: String,
        required: true,
        minlength: 5
    },
    businessAddress: {
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
const Vendor = db.model('Vendor', vendorSchema);

// Export Vendor Model
module.exports = Vendor;