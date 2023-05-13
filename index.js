const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 3000;
// Import Bcrypt Module
const bcrypt = require('bcrypt');

// Import Model Modules
const Product = require('./model/Product');
const Customer = require('./model/Customer');
const Vendor = require('./model/Vendor');
const Shipper = require('./model/Shipper');
const Order = require('./model/Order');
const DistributionHub = require('./model/DistributionHub');

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Customer Registration
app.post('/customer/register', async (req, res) => {
  const {username, password, ...otherProperties} = req.body;
  const hashedPassword = await bcrypt.hash(password, 5);
  const customer = new Customer({username, password: hashedPassword, ...otherProperties});
  customer.save()
  .then((customer) => {res.send(customer)}) // Test
  .catch((error) => {res.send(error.message)})
})

// Vendor Registration
app.post('/vendor/register', async (req, res) => {
  const {username, password, ...otherProperties} = req.body;
  const hashedPassword = await bcrypt.hash(password, 5);
  const vendor = new Vendor({username, password: hashedPassword, ...otherProperties});
  vendor.save()
  .then((vendor) => {res.send(vendor)}) // Test
  .catch((error) => {res.send(error.message)})
})

// Shipper Registration
app.post('/shipper/register', async (req, res) => {
  const {username, password, ...otherProperties} = req.body;
  const hashedPassword = await bcrypt.hash(password, 5);
  const shipper = new Shipper({username, password: hashedPassword, ...otherProperties});
  shipper.save()
  .then((shipper) => {res.send(shipper)}) // Test
  .catch((error) => {res.send(error.message)})
})

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
  });