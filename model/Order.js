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
    address: {
        type: String,
        required: true,
        minlength: 5
    },
    phone: {
        type: String,
        required: true
    },
    country: {
        type: String,
        enum: ['Vietnam', 'Australia', 'United State'],
        required: true
    },
    postal: {
        type: String,
        required: true
    },
    distributionHub: {
        type: String,
        enum: ['Hub1', 'Hub2', 'Hub3']
    },
    emailAddress: {
        type: String,
        required: true
    },
    product: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Product'
    }],
    customerID: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Customer' 
    },
    orderStatus: {
        type: String,
        enum: ['active', 'delivered', 'canceled'],
        default: 'active'
    },
    totalPrice: {
        type: Number
    }
});

// Define Order Model
const Order = db.model('Order', orderSchema);

// Export Order Model
module.exports = Order;