const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 3000;
// Import Bcrypt Module
const bcrypt = require('bcrypt');
// Import Session Module
const session = require('express-session')
const fs = require('fs');

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
    .then(() => { res.redirect('/login') }) 
    .catch((error) => { res.send(error.message) })
});

app.get('/customer/register', (req, res) => {
  res.render('register_page_customer')
})

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
    .then(() => { res.redirect('/login') }) 
    .catch((error) => { res.send(error.message) })
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
    .then(() => { res.redirect('/login')}) // Test
    .catch((error) => { res.send(error.message) })
});

app.get('/shipper/register', (req, res) => {
  res.render('register_page_shipper')
})

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
  const vendorID = req.session.user._id;
  const product = new Product({
    ...req.body,
    image: req.file.filename,
    vendor: vendorID
  });
  product.save()
    .then(() => { 
    res.redirect('/vendor/view-products') })
    .catch((error) => { res.send(error.message) })
});

// VENDOR VIEW THEIR PRODUCTS
app.get('/vendor/view-products', (req, res) => {
  const vendor = req.session.user;
  Product.find({ vendor: req.session.user._id })
    .then((matchedProducts) => {
      if (!matchedProducts) {
        return res.send("Cannot found any product!");
      }
      res.render('view-products', { matchedProducts, vendor })
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
  const userLoggedIn = req.session.user ? true : false;
  Product.findById(req.params.id)
    .then((product) => {
      if (!product) {
        return res.send("Cannot found any product!");
      }
      res.render('product-detail', { product, userLoggedIn });
    })
    .catch((error) => res.send(error));
});

// GET REQUEST FOR CATEGORY PAGE 
app.get('/category-page/:category', (req, res) => {
  const categoryName = req.params.category;
  const userLoggedIn = req.session.user ? true : false;
  Product.find({ category: req.params.category })
    .then((matchedProducts) => {
      if (!matchedProducts) {
        return res.send("Cannot found any product!");
      }
      res.render('category-page', { matchedProducts, categoryName, userLoggedIn });
    })
    .catch((error) => res.send(error));
})

// SEARCH PRODUCT FOR CUSTOMER
app.post('/customer/search', (req, res) => {
  const searchItem = req.body.searchItem;
  const userLoggedIn = req.session.user ? true : false;
  Product.find({ name: { $regex: searchItem, $options: 'i' } })  // condition for searching item
    .then((matchedProducts) => {
      if (!matchedProducts) {
        return res.send("Cannot found any product!");
      }
      res.render('search-result', { matchedProducts, userLoggedIn })
    })
    .catch((error) => res.send(error));
});

// SEARCH PRODUCT FOR VENDOR
app.post('/vendor/search', (req, res) => {
  const vendorId = req.session.user._id;
  const searchItem = req.body.searchItem;
  const vendor = req.session.user;
  Product.find({ 
    name: { $regex: searchItem, $options: 'i' },
    vendor: vendorId
   })  // condition for searching item
    .then((matchedProducts) => {
      if (!matchedProducts) {
        return res.send("Cannot found any product!");
      }
      res.render('search-result-vendor', { matchedProducts, vendor })
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
  if (req.session.user) {
    const userId = req.session.user._id;
    Promise.all([Customer, Vendor,Shipper].map(Model => Model.findOne({ _id: userId })))
    .then(([customer, vendor, shipper]) => {
      const user = customer || vendor || shipper;
      if (!user) {
        return res.status(404).send({ message: 'User not found.' });
      }
      const userRole = user.role;
      res.redirect(`/${userRole}-page`)
    })
    .catch((error) => res.send(error.message))
  }
  else {renderHome(req, res, 'homepage')}
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
          Customer.findByIdAndUpdate(customerId, { $set: { cart: [] } }, { new: true })
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

// VIEW ACTIVE ORDER BASED ON DISTRIBUTION HUB
app.get('/active-order', (req, res) => {
  const shipperHub = req.session.user.distributionHub
  const shipperName = req.session.user.username

  // Find the order(s) having the same hub as the shipper
  Order.find({ distributionHub: shipperHub })
    .populate('product')
    // .populate('customerID')
    .then((orders) => {
      res.render('all-order', { orders, shipperName })
    })
    .catch((error) => { res.send(error.message) })
})

// VIEW ORDER DETAIL
app.get('/order/:id', (req, res) => {
  const orderID = req.params.id;
  const shipperName = req.session.user.username;

  // Find the order matching the orderID
  Order.findById(orderID)
    .populate('product')
    .then((order) => {
      if (!order) { res.render('No Order Match') }
      res.render('order-detail', { order, shipperName })
    })
    .catch((error) => {res.send(error.message)})
})

// CHANGE ORDER STATUS 
app.post('/order-status', (req, res) => {
  const orderStatus = req.body.orderStatus;
  const orderID = req.body.orderID;

  // Find the order with this ID and delete it in the Order database when the status change
  if (orderStatus != 'active') {
    Order.findByIdAndDelete(orderID)
      .then((deletedOrder) => {
        if (deletedOrder) { return res.redirect('/active-order') }
        res.send('No Order Found')
      })
      .catch((error) => { res.send(error.message) })
  }
  else { res.send('Invalid Order Status') }
})

// LOGOUT
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      res.sendStatus(500);
    } else {
      // Redirect the user to the login page or any other desired destination
      res.redirect('/');
    }
  });
});

// vendor register page
app.get('/vendor/register', (req, res) => {
  res.render('register_page_vendor')
})


// MIDDLEWARE TO CHECK IF USER IS LOGGED IN WHEN VIEWING PAGES CONTAIN PERSONAL INFORMATION
let isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// VENDOR VIEW THEIR INFO
app.get('/vendor-page', isLoggedIn, (req, res) => {
  const vendorId = req.session.user._id;
  const vendorName = req.session.user.username;
  Vendor.findById(vendorId)
    .then((vendor) => {
      if (!vendor) {
        return res.send("Cannot found vendor ID!");
      }
      res.render('vendor-page', { vendor, vendorName });
    })
    .catch((error) => { res.send(error.message); });
});

// SHIPPER VIEW THEIR INFO
app.get('/shipper-page', isLoggedIn, (req, res) => {
  const shipperId = req.session.user._id;
  Shipper.findById(shipperId)
    .then((shipper) => {
      if (!shipper) {
        return res.send("Cannot found shipper ID!");
      }
      res.render('shipper-page', { shipper });
    })
    .catch((error) => { res.send(error.message); });
});

// CUSTOMER VIEW THEIR INFO
app.get('/my-account-user', isLoggedIn, (req, res) => {
  const userId = req.session.user._id;
  Customer.findById(userId)
    .then((customer) => {
      if (!customer) {
        return res.send('No user found');
      }
      res.render('my-account-user', { customer });
    })
    .catch((error) => res.send(error.message));
});


// CHANGE PROFILE PICTURE
app.post('/changeProfilePic', profilePicUpload.single('profilePicture'), (req, res) => {
  const userId = req.session.user._id;
  Promise.all([
    Customer.findOne({ _id: userId }),
    Vendor.findOne({ _id: userId }),
    Shipper.findOne({ _id: userId })
  ])
    .then(([customer, vendor, shipper]) => {
      // Check if the user already exist (any of the value is not falsy, add that value to the user var)
      const user = customer || vendor || shipper
      const currentPicture = user.profilePicture;
      // delete the current profile picture except the default one
      fs.unlink(`public/assets/profilePics/${currentPicture}`, (error) => {
        if (error) {
          console.log('Error deleting profile picture:', error);
        }
      });
      // Update the profile picture with the new uploaded picture
      user.updateOne({ $set: { profilePicture: req.file ? req.file.filename : req.body.profilePicture } })
        .then(() => {
          if (user.role === 'customer') {
            res.redirect('/my-account-user');
          } else if (user.role === 'vendor') {
            res.redirect('/vendor-page');
          } else if (user.role === 'shipper') {
            res.redirect('/shipper-page');
          }
        })
        .catch((error) => res.send(error.message))
    })
    .catch((error) => res.send(error.message));
});

// CREATING THE DISTRIBUTION HUBS (through Postman)
app.post('/distributionHub', (req, res) => {
  const distributionHub = new DistributionHub(req.body);
  console.log(req.body);  // for testing purpose
  distributionHub.save()
  .then(() => { console.log('New Distribution Hub saved');}) 
  .catch((error) => { console.log(error.message); });
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});