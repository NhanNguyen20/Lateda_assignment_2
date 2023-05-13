const mongoose = require('mongoose');
const Order = require('./Order')

// Define DistributionHub Schema
const distributionHubSchema = new mongoose.Schema({
    name: {},
    address: {},
    order: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Order'
    }]
})

// Define DistributionHub Model
const DistributionHub = mongoose.model('DistributionHub', distributionHubSchema);

// Export DistributionHub Model
module.exports = DistributionHub;