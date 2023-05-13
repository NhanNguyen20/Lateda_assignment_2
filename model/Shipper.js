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
        maxlength: 15,
        match: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]*$/,
        required: true
    }, 
    profilePicture: {
        type: String
    },
    distributionHub: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'DistributionHub'
    }
});

// Define Shipper Model 
const Shipper = db.model('Shipper', shipperSchema);

// Export Shipper Model
module.exports = Shipper;
