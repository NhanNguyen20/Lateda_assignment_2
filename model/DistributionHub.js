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
const Order = require('./Order')

// Define DistributionHub Schema
const distributionHubSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ['Hub1', 'Hub2', 'Hub3'],
        required: true
    },
    address: {
        type: String
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Order'
    }]
});

// Define DistributionHub Model
const DistributionHub = db.model('DistributionHub', distributionHubSchema);

// Export DistributionHub Model
module.exports = DistributionHub;