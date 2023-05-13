const mongoose = require('mongoose');
const db = require('./db');
const Vendor = require('./Vendor')

// Define Product Schema 
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {type: String},
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['woman', 'man', 'electronics']
    },
    vendor: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Vendor'
    }]
})

// Define Product Model
const Product = db.model('Product', productSchema)

// Export Product Module
module.exports = Product;