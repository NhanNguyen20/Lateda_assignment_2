const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 3000;
// Import Bcrypt Module
const bcrypt = require('bcrypt');
// Import Session Module
const session = require('express-session')


const multer = require('multer');
const profileStorage = multer.diskStorage({
  destination: 'public/assets/profilePics',
  filename: function (req, file, cb) {
    cb(null, file.originalname); // set the filename as the original name of the uploaded file
  }
});
const productStorage = multer.diskStorage({
  destination: 'public/assets/products',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const profilePicUpload = multer({ storage: profileStorage });
const productUpload = multer({ storage: productStorage });

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
app.post('/customer/register', profilePicUpload.single('profilePicture'), async (req, res) => {
  const { username, password, ...otherProperties } = req.body;
  // Validate user's password before transform to hashed 
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).send({ message: 'Invalid password. Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character from the set !@#$%^&*. Length from 8 to 20 characters long.' })
  }

  // Create hashed password
  const hashedPassword = await bcrypt.hash(password, 5);    // waiting for generating hash password
  const customer = new Customer({
    username,
    password: hashedPassword,
    profilePicture: req.file ? req.file.filename : Customer.schema.paths.profilePicture.default(),
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
      res.render('my-account', { user: customer });
    })
    .catch((error) => res.send(error));
});

// Vendor Registration
app.post('/vendor/register', profilePicUpload.single('profilePicture'), async (req, res) => {
  const { username, password, ...otherProperties } = req.body;
  // Validate user's password before transform to hashed 
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).send({ message: 'Invalid password. Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character from the set !@#$%^&*. Length from 8 to 20 characters long.' })
  }

  // Create hashed password
  const hashedPassword = await bcrypt.hash(password, 5);
  const vendor = new Vendor({
    username, password: hashedPassword,
    profilePicture: req.file ? req.file.filename : Vendor.schema.paths.profilePicture.default(),
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
      res.render('my-account', { user: vendor });
    })
    .catch((error) => res.send(error));
});

// Shipper Registration
app.post('/shipper/register', profilePicUpload.single('profilePicture'), async (req, res) => {
  const { username, password, ...otherProperties } = req.body;
  // Validate user's password before transform to hashed 
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).send({ message: 'Invalid password. Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character from the set !@#$%^&*. Length from 8 to 20 characters long.' })
  }

  // Create hashed password
  const hashedPassword = await bcrypt.hash(password, 5);
  const shipper = new Shipper({
    username, password: hashedPassword,
    profilePicture: req.file ? req.file.filename : Vendor.schema.paths.profilePicture.default(),
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
      res.render('my-account', { user: shipper });
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
            res.render('customer-page', { user });
          } else if (user.role === 'vendor') {
            res.render('vendor-page', { user });
          } else if (user.role === 'shipper') {
            res.render('shipper-page', { user });
          }
        })
        .catch((error) => { res.send(error.message) })
    })
    .catch((error) => { res.send(error.message) })
})

// GET request for Vendor homepage   
app.get('vendor/:id/add-product', (req, res) => {
  Vendor.findById(req.params.id)
    .then((vendor) => {
      if (!vendor) {
        return res.send("Cannot found vendor ID!");
      }
      res.render('add-product', { vendor });
    })
    .catch((error) => res.send(error));
});

// create a new product with vendor's id
app.post('/vendor/add-product', productUpload.single('image'), (req, res) => {
  const product = new Product({
    ...req.body,
    image: req.file.filename
  });
  product.save()
    .then((product) => { res.send(product) })
    .catch((error) => { res.send(error.message) })
});

app.get('/vendor/:id/view-products', (req, res) => {
  Product.find({ vendor: req.params.id })
    .then((matchedProducts) => {
      if (!matchedProducts) {
        return res.send("Cannot found any product!");
      }
      res.render('view-products', { matchedProducts })
    })
    .catch((error) => res.send(error));
});

app.get('/login', (req, res) => {
  res.render('login');
})

// DISPLAY CART PAGE 
app.get('/cart', (req, res) => {
  // Get customer's user ID from the session
  const customerID = req.session.user._id;

  // Retrieve customer's document and populate the shopping cart
  Customer.findById(customerID)
    .populate('cart') // Populate the 'cart' field with actual product objects
    .then((foundCustomer) => {
      if (!foundCustomer) {
        res.send('No customer found');
      }
      // If found, render the cart page with the retrieved products in the customer's cart
      res.render('cart-page', { cart: foundCustomer.cart });
    })
    .catch((error) => {
      console.log(error);
      res.send('Error retrieving customer data');
    });
});


// ADD PRODUCT TO CART
app.post('/cart/add/:productID', (req, res) => {
  // Get customer ID from the session and product ID from the request
  const customerID = req.session.user._id;
  const productID = req.params.productID;

  // Find the customer in Customer database and add the product to their cart
  Customer.findByIdAndUpdate(
    customerID, { $addToSet: { cart: productID } }, { new: true })
    .then((customer) => {
      if (!customer) { res.send('Cannot find customer') }
      res.redirect('/cart')
    })
    .catch((error) => { res.send(error.message) })
})

// REMOVE PRODUCT FROM CART
app.post('/cart/remove', (req, res) => {
  // Get customer ID from the session and product ID from the request parameters
  const customerID = req.session.user._id;
  const productID = req.body.productID;

  // Find the customer in the Customer database and delete the product from their cart
  Customer.findByIdAndUpdate(customerID, { $pull: { cart: productID } }, { new: true })
    .then((customer) => {
      if (!customer) {
        res.send('Cannot find customer');
      }
      else {
        // If the cart still has items, redirect to the cart page
        res.redirect('/cart');
      }
    })
    .catch((error) => {
      res.send(error.message);
    });
});


// GET request for showing product detail
app.get('/product/:id', (req, res) => {
  Product.findById(req.params.id)
    .then((product) => {
      if (!product) {
        return res.send("Cannot found any product!");
      }
      res.render('product-detail', { product });
    })
    .catch((error) => res.send(error));
})

// GET request for category pages
app.get('/category-page/:category', (req, res) => {
  const categoryName = req.params.category;
  Product.find({ category: req.params.category })
    .then((matchedProducts) => {
      if (!matchedProducts) {
        return res.send("Cannot found any product!");
      }
      res.render('category-page', { matchedProducts, categoryName });
    })
    .catch((error) => res.send(error));
})

// Search products for customer
app.post('/customer/search', (req, res) => {
  const searchItem = req.body.searchItem;
  Product.find({ name: { $regex: searchItem, $options: 'i' } })  // condition for searching item
    .then((matchedProducts) => {
      if (!matchedProducts) {
        return res.send("Cannot found any product!");
      }
      res.render('search-result', { matchedProducts })
    })
    .catch((error) => res.send(error));
});

// Filter products for category pages
app.post('/category/:category/filter', (req, res) => {
  const categoryName = req.params.category;
  const filterPrice = req.body.priceRange;
  Product.find({
    category: req.params.category,
    price: { $lte: filterPrice }
  })  // find products that less than or equal to the inputted price
    .then((matchedProducts) => {
      if (!matchedProducts) {
        return res.send("Cannot found any product below that price!");
      }
      res.render('category-page', { matchedProducts, categoryName });
    })
    .catch((error) => res.send(error));
})

// Function for render the homepage type (default )
function renderHome(req, res, fileName) {
  const trendAmount = 8;
  const featuredAmount = 6;
  // Find 6 featured products
  Product.find().limit(featuredAmount)
    .then((pickedProducts) => {
      // Get the total count of products in the database
      Product.countDocuments()
        .then((totalProduct) => {
          // Generate random indices within the range of available products
          const randomIndices = [];
          while (randomIndices.length < trendAmount) {
            const randomIndex = Math.floor(Math.random() * totalProduct);
            // If the index haven't included, add to index array
            if (!randomIndices.includes(randomIndex)) {
              randomIndices.push(randomIndex);
            }
          }
          // Find the products based on the random indices
          Product.aggregate([
            { $sample: { size: trendAmount } },
          ])
            .then((randomProducts) => {
              const randomLeft = randomProducts.slice(0, 4);
              const randomRight = randomProducts.slice(4, 8);
              res.render(fileName, { randomLeft, randomRight, pickedProducts });
            })
            .catch((error) => {
              res.send(error.message);
            });
        })
        .catch((error) => {
          res.send(error.message);
        });
    })
    .catch((error) => {
      res.send(error.message);
    });
}

// Generate random products for homepage
app.get('/', (req, res) => {
  renderHome(req, res, 'homepage')
});
// Generate random products for customer page
app.get('/customer-page', (req, res) => {
  renderHome(req, res, 'customer-page')
});


// See Checkout page
app.get('/checkout', (req, res) => {
  const customerID = req.session.user._id;
  Customer.findById(customerID)
    .populate('cart')
    .then((customer) => {
      if (!customer) { return res.send('No customer found') }
      res.render('checkout', { cart: customer.cart })
    })
    .catch((error) => { res.send(error.message) })
})

// Place Order (create Order)
app.post('/checkout', (req, res) => {
  const customerId = req.session.user._id;
  const randomHub = Math.floor(Math.random() * 3);
  let totalPrice = 0;
  Customer.findById(customerId)
  .populate('cart')
    .then((customer) => {
      if (!customer) {
        return res.send('Customer not found');
      }
      for (let i = 0; i < customer.cart.length; i++) {
        totalPrice += customer.cart[i].price;
      }
      const order = new Order({
        ...req.body,
        customerID: customerId,
        product: customer.cart,
        distributionHub: Order.schema.path('distributionHub').enumValues[randomHub],
        totalPrice: totalPrice
      });
      order.save()
        .then(() => {
          // Clear the cart after creating the order
          Customer.findByIdAndUpdate(customerId, { $set: { cart: [] }}, { new: true })
          .then((customerUpdate) => {
            if (!customerUpdate) {
              return res.send('Customer not found');
            }
            res.redirect('/customer-page')
          })
            .catch((error) => {
              res.send(error.message);
            });
        })
        .catch((error) => {
          res.send(error.message);
        });
    })
    .catch((error) => {
      res.send(error.message);
    });
});


app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});