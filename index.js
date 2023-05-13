const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 3000;
// Import Bcrypt Module
const bcrypt = require('bcrypt');

const multer = require('multer');
const storage = multer.diskStorage({
  destination: 'public/assets/profilePics',
  filename: function(req, file, cb) {
    cb(null, file.originalname); // set the filename as the original name of the uploaded file
  }
});
const upload = multer({ storage: storage });

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
app.post('/customer/register', upload.single('profilePicture'), (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  // const hashedPassword = await bcrypt.hash
  const customer = new Customer({
    ...req.body,
    profilePicture: req.file.filename
  });
  customer.save()
  .then((customer) => {res.send(customer)}) // Test
  .catch((error) => {res.send(error.message)})
});

// My Account for Customer
app.get('/customer/:id', (req, res) => {
  Customer.findById(req.params.id)
    .then((customer) => {
      if (!customer) {
        return res.send("Cannot found customer ID!");
      }
      res.render('my-account', {customer});
    })
    .catch((error) => res.send(error));
});

// Vendor Registration
app.post('/vendor/register', (req, res) => {
  const vendor = new Vendor(req.body) 
  vendor.save()
  .then((vendor) => {res.send(vendor)}) // Test
  .catch((error) => {res.send(error.message)})
})

// Shipper Registration
app.post('/shipper/register', (req, res) => {
  const shipper = new Shipper(req.body) 
  shipper.save()
  .then((shipper) => {res.send(shipper)}) // Test
  .catch((error) => {res.send(error.message)})
})

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
  });