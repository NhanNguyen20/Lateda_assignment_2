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

const mongoose = require('mongoose')
const db = require('./db');
const Product = require('./Product.js');
const Vendor = require('./Vendor');
const Shipper = require('./Shipper');

// Define Customer Schema
const customerSchema = new mongoose.Schema({
    username: {
        type: String,
        maxlength: 15,
        minlength: 8,
        match: /^[a-zA-Z0-9]+$/,
        unique: true,
        required: true,
        validate: {
            validator: async function(value) {  // 'value' is the value of 'username' being validated
                const customer = await this.constructor.findOne({ username: value});
                const vendor = await mongoose.model('Vendor').findOne({username: value});
                const shipper = await mongoose.model('Shipper').findOne({username: value});
                if (customer || vendor || shipper) {
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
    name: {
        type: String,
        minlength: 5,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    cart: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
      ],
    role: {
        type: String,
        default: 'customer'
    }
})

// Define Customer Model
const Customer = db.model('Customer', customerSchema);

// Export Customer Model
module.exports = Customer;
