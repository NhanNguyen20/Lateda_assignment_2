const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 3000;

// import model files
const Product = require('./model/Product');
const Customer = require('./model/Customer');
const Vendor = require('./model/Vendor');
const Shipper = require('./model/Shipper');
const Order = require('./model/Order');
const DistributionHub = require('./model/DistributionHub');

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));



app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
  });