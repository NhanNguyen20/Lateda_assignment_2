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
        required: true
    }, 
    profilePicture: {
        type: String,
        default: 'defaultUserPic.jpeg'
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
    }],
    role: {
        type: String,
        default: 'vendor'
    }
});

// Define Vendor Model
const Vendor = db.model('Vendor', vendorSchema);

// Export Vendor Model
module.exports = Vendor;