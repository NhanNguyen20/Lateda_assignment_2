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