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
const DistributionHub = require('./DistributionHub');
const Customer = require('./Customer');
const Vendor = require('./Vendor');

// Define Shipper Schema 
const shipperSchema = new mongoose.Schema({
    username: {
        type: String,
        maxlength: 15,
        minlength: 8,
        match: /^[a-zA-Z0-9]+$/,
        unique: true,
        required: true,
        validate: {
            validator: async function(value) {
                const shipper = await this.constructor.findOne({username: value});
                const customer = await mongoose.model('Customer').findOne({username: value});
                const vendor = await mongoose.model('Vendor').findOne({username: value});
                if (shipper || customer || vendor) {
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
    distributionHub: {
        type: String
    },
    role: {
        type: String,
        default: 'shipper'
    } 
});

// Define Shipper Model 
const Shipper = db.model('Shipper', shipperSchema);

// Export Shipper Model
module.exports = Shipper;
