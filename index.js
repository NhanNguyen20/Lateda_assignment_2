const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 3000;
// Import Bcrypt Module
const bcrypt = require('bcrypt');
// Import Session Module
const session = require('express-session')


const multer = require('multer');
const storage = multer.diskStorage({
  destination: 'public/assets/profilePics',
  filename: function (req, file, cb) {
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
app.use(session({
  secret: 'my-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // session lasts for 24 hours
  }
}))

// Customer Registration
app.post('/customer/register', upload.single('profilePicture'), async (req, res) => {
  const { username, password, ...otherProperties } = req.body;
  const hashedPassword = await bcrypt.hash(password, 5);    // waiting for generating hash password
  const customer = new Customer({
    username, password: hashedPassword,
    profilePicture: req.file.filename,
    ...otherProperties
  });
  customer.save()
    .then((customer) => { res.send(customer) }) // Test
    .catch((error) => { res.send(error.message) })
});

// My Account for Customer
app.get('/customer/:id/myaccount', (req, res) => {
  Customer.findById(req.params.id)
    .then((customer) => {
      if (!customer) {
        return res.send("Cannot found customer ID!");
      }
      res.render('my-account', { customer });
    })
    .catch((error) => res.send(error));
});

// Vendor Registration
app.post('/vendor/register', upload.single('profilePicture'), async (req, res) => {
  const { username, password, ...otherProperties } = req.body;
  const hashedPassword = await bcrypt.hash(password, 5);
  const vendor = new Vendor({
    username, password: hashedPassword,
    profilePicture: req.file.filename,
    ...otherProperties
  });
  vendor.save()
    .then((vendor) => { res.send(vendor) }) // Test
    .catch((error) => { res.send(error.message) })
});
// My Account for Vendor
app.get('/vendor/:id/myaccount', (req, res) => {
  Vendor.findById(req.params.id)
    .then((vendor) => {
      if (!vendor) {
        return res.send("Cannot found vendor ID!");
      }
      res.render('my-account', { vendor });
    })
    .catch((error) => res.send(error));
});

// Shipper Registration
app.post('/shipper/register', upload.single('profilePicture'), async (req, res) => {
  const { username, password, ...otherProperties } = req.body;
  const hashedPassword = await bcrypt.hash(password, 5);
  const shipper = new Shipper({
    username, password: hashedPassword,
    profilePicture: req.file.filename,
    ...otherProperties
  });
  shipper.save()
    .then((shipper) => { res.send(shipper) }) // Test
    .catch((error) => { res.send(error.message) })
});
// My Account for Shipper
app.get('/shipper/:id/myaccount', (req, res) => {
  Shipper.findById(req.params.id)
    .then((shipper) => {
      if (!shipper) {
        return res.send("Cannot found customer ID!");
      }
      res.render('my-account', { shipper });
    })
    .catch((error) => res.send(error));
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body

  // Check if the user have provided username and password
  if (!username || !password) {
    return res.status(400).send({ message: 'Please enter username and password' });
  }

  // Find the username and password in all three schema
  Promise.all([
    Customer.findOne({ username: username }),
    Vendor.findOne({ username: username }),
    Shipper.findOne({ username: username })
  ])
    .then(([customer, vendor, shipper]) => {
      // Check if the user already exist (any of the value is not falsy, add that value to the user var)
      const user = customer || vendor || shipper
      if (!user) {
        return res.status(401).send({ message: 'Invalid username or password.' });
      }

      // Check if the password of the user is correct
      bcrypt.compare(password, user.password)
        .then((isValid) => {
          if (!isValid) { return res.status(401).send({ message: 'Invalid username or password.' }); }
          // Delete the password from the user object
          delete user.password;

          // Set the user object in the session
          req.session.user = user;

          // Redirect the user to the appropriate page based on their role
          if (user.role === 'customer') {
            res.redirect('/customer/myaccount');
          } else if (user.role === 'vendor') {
            res.redirect('/vendor/dashboard');
          } else if (user.role === 'shipper') {
            res.redirect('/shipper/orders');
          }
        })
        .catch((error) => { res.send(error.message) })
    })
    .catch((error) => { res.send(error.message) })
})

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});