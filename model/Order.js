const mongoose = require('mongoose');
const db = require('./db');
const Product = require('./Product');


// Define Order Schema 
const orderSchema = new mongoose.Schema({
    custName: {
        type: String,
        required: true,
        minlength: 5
    },
    custAddress: {
        type: String,
        required: true,
        minlength: 5
    },
    distributionHub: {
        type: String,
        enum: ['Hub1', 'Hub2', 'Hub3']
    },
    product: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Product'
    }]
});

// Define Order Model
const Order = db.model('Order', orderSchema);

// Export Order Model
module.exports = Order;