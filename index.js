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

// CUSTOMER REGISTRATION
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

// MY ACCOUNT FOR CUSTOMER
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

// VENDOR REGISTRATION
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
// MY ACCOUNT FOR VENDOR
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

// SHIPPER REGISTRATION
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
// MY ACCOUNT FOR SHIPPER 
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

// LOGIN
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
            res.redirect('/customer-page');
          } else if (user.role === 'vendor') {
            res.redirect('/vendor-page');
          } else if (user.role === 'shipper') {
            res.redirect('/shipper-page');
          }
        })
        .catch((error) => { res.send(error.message) })
    })
    .catch((error) => { res.send(error.message) })
})

app.get('/vendor-page', (req, res) => {
  res.render('vendor-page')
})

// GET REQUEST FOR VENDOR HOMEPAGE   
app.get('/vendor/add-product', (req, res) => {
  Vendor.findById(req.session.user._id)
    .then((vendor) => {
      if (!vendor) {
        return res.send("Cannot found vendor ID!");
      }
      res.render('add-product', { vendor });
    })
    .catch((error) => res.send(error));
});

// CREATE A NEW PRODUCT
app.post('/vendor/add-product', productUpload.single('image'), (req, res) => {
  const product = new Product({
    ...req.body,
    image: req.file.filename
  });
  product.save()
    .then((product) => { res.send(product) })
    .catch((error) => { res.send(error.message) })
});

// VENDOR VIEW THEIR PRODUCTS
app.get('/vendor/view-products', (req, res) => {
  Product.find({ vendor: req.session.user._id })
    .then((matchedProducts) => {
      if (!matchedProducts) {
        return res.send("Cannot found any product!");
      }
      res.render('view-products', { matchedProducts })
    })
    .catch((error) => res.send(error));
});

// DISPLAY LOGIN FORM
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

// GET REQUEST FOR CATEGORY PAGE 
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

// SEARCH PRODUCT FOR CUSTOMER
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

// FILTER PRODUCT FOR CUSTOMER
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

// FUNCTION FOR RENDER THE HOMEPAGE TYPE (DEFAULT)
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

// GENERATE RANDOM PRODUCT FOR HOMEPAGE
app.get('/', (req, res) => {
  renderHome(req, res, 'homepage')
});
// GENERATE RANDOM PRODUCT FOR CUSTOMER PAGE
app.get('/customer-page', (req, res) => {
  renderHome(req, res, 'customer-page')
});


// GET CHECKOUT PAGE
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

// PLACE ORDER (CREATE ORDER)
app.post('/checkout', (req, res) => {
  const customerId = req.session.user._id;
  const randomHub =
    Customer.findById(customerId)
      .then((customer) => {
        const order = new Order({
          ...req.body,
          customerID: customerId,
          product: customer.cart  // assign cart of customer for order's products
        });
        order.save()
          .then((order) => { res.send(order) })
          .catch((error) => { res.send(error.message) })
      })
      .catch((error) => res.send(error.message));
})


app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});