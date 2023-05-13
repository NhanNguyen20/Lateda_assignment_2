const mongoose = require('mongoose');
const DistributionHub = require('./DistributionHub');

// Define Shipper Schema 
const shipperSchema = new mongoose.Schema({
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
    distributionHub: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'DistributionHub'
    }
});

// Define Shipper Model 
const Shipper = mongoose.model('Shipper', shipperSchema);

// Export Shipper Model
module.exports = Shipper;