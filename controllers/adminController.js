const Product = require('../models/product');
const Order = require('../models/order'); // Assuming you have an Order model
const User = require('../models/user'); // Assuming you have a User model
const Admin = require('../models/admin');  
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

// Controller to handle admin login
exports.getLoginpage = (req, res, next) => {
  res.render('admin/login');
};
exports.postAdminLogin = async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body,'body');
  
  try {
    // Find the admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).send('Incorrect username or password');
    }

    // Check if the password matches (assuming it's hashed)
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).send('Incorrect username or password');
    }

    // Successful login
    req.session.isAuthenticated = true;
    req.session.adminUser = admin.username;
    res.redirect('overview');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('An error occurred during login');
  }
};



exports.getOverview = async (req, res) => {
  try {
    // Fetching data for the dashboard overview
    const totalProducts = await Product.countDocuments(); // Total number of products
    const totalOrders = await Order.countDocuments();     // Total number of orders
    const lowStock = await Product.countDocuments({ stock: { $lt: 5 } }); // Low stock products
    const totalUsers = await User.countDocuments();       // Total number of users

    // Pass the data to the overview view
    res.render("admin/overview", {
      totalProducts,
      totalOrders,
      lowStock,
      totalUsers,
      recentActivities: [
        "Added a new product",
        "Updated stock for product ID 123",
        "Deleted product ID 456"
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Add New Product
exports.getAddProduct = (req, res, next) => {
  res.render('admin/add-product');
};


// Set up storage for the uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'public/uploads'); // Directory to save the uploaded files
  },
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Unique filename
  }
});

// Initialize multer
const upload = multer({ storage: storage });

// Export the multer middleware to be used in routes
exports.upload = upload.single('image');




// Controller function to add a product
exports.addProduct = async (req, res, next) => {
  const { name, price, stock, description } = req.body;
  const image = req.file ? req.file.filename : null;

  const newProduct = new Product({
      name,
      price,
      stock,
      description,
      image // Save the image filename to the product document
  });

  try {
      await newProduct.save();
      res.redirect('/admin/product-list'); // Redirect to product list after adding
  } catch (error) {
      console.error('error saving product:',error);
      res.status(500).send('Server Error');
  }
};

// Edit Product
exports.getEditProduct = async (req, res, next) => {
  try {
      const product = await Product.findById(req.params.id);
      if (!product) {
          return res.status(404).send('Product not found');
      }
      res.render('admin/edit-product', { product });
  } catch (err) {
      console.log(err);
      res.status(500).send('Server error');
  }
};

exports.postEditProduct = async (req, res, next) => {
  const { name, price, stock, description } = req.body;
  let updatedImage = req.file ? req.file.filename : null;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    // If a new image is uploaded, remove the old one from the filesystem
    if (updatedImage) {
      if (product.image) {
        fs.unlinkSync(path.join(__dirname, '..', 'public', 'uploads', product.image)); // delete old image
      }
      product.image = updatedImage; // update the image field with the new filename
    }

    // Update other product fields
    product.name = name;
    product.price = price;
    product.stock = stock;
    product.description = description;

    await product.save(); // Save changes to MongoDB

    res.redirect('/admin/product-list');
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
};

// Delete Product
exports.postDeleteProduct = async (req, res, next) => {
  try {
      await Product.findByIdAndDelete(req.params.id);
      res.redirect('/admin/product-list');
  } catch (err) {
      console.log(err);
      res.status(500).send('Server error');
  }
};

// List Products
exports.getProductList = async (req, res, next) => {
    try {
        const products = await Product.find();
        res.render('admin/product-list', { products });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server error');
    }
};

// Stock Management
exports.getStock = async (req, res, next) => {
    try {
        const lowStockProducts = await Product.find({ stock: { $lt: 5 } });
        res.render('admin/stock', { lowStockProducts });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server error');
    }
};

// In your adminController.js
exports.logout = (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Failed to destroy session:', err);
                return res.status(500).send('Failed to log out');
            }
            res.redirect('/admin/login'); 
        });
    } else {
        res.redirect('/admin/login'); 
    }
};

exports.getUserOverview = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();

    // Render the userOverview view with the list of users
    res.render('admin/userOverview', { users });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}

exports.getUserOrders = async (req, res) => {
  try {
      const userId = req.params.id;
      const orders = await Order.find({ userId });
      res.json(orders);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Toggle block/unblock status for a user
exports.toggleBlockUser = async (req, res) => {
  try {
      const userId = req.params.id;
      const user = await User.findById(userId);
      if (user) {
          // Toggle the block status
          user.isBlocked = !user.isBlocked;
          await user.save();

          // Log the updated status for debugging
          console.log(`User ${userId} is now ${user.isBlocked ? "blocked" : "unblocked"}`);

          // Send a clear response with the new status
          res.json({
              message: user.isBlocked ? 'User blocked' : 'User unblocked',
              isBlocked: user.isBlocked 
          });
      } else {
          res.status(404).json({ message: 'User not found' });
      }
  } catch (error) {
      console.error("Error toggling user block status:", error);
      res.status(500).json({ message: 'Error blocking/unblocking user' });
  }
};

// orderController.js


exports.getUserOrdersPage = async (req, res) => {
    try {
        const userId = req.params.id;
        const orders = await Order.find({ userId }); // Ensure `userId` exists in the `Order` schema
        res.render('admin/orders', { orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error"); // Sends an error message to the client
    }
};

// Update order status
// Update order status
exports.updateOrderStatus = async (req, res) => {
  const orderId = req.params.orderId; // use orderId here
  const { status } = req.body;
  console.log(status);

  try {
    const order = await Order.findById(orderId);
    if (order) {
      order.status = status;
      await order.save();
      res.json({ success: true, message: 'Order status updated successfully.' });
    } else {
      res.status(404).json({ success: false, message: 'Order not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error updating order status.' });
  }
};

exports.getOrderManagement = async (req, res) => {
  try {
      // Fetch all orders, populate user details if necessary
      const orders = await Order.find().populate('userId'); // Assuming each order has a userId field

      // Render the 'order-management' page with the orders
      res.render('admin/order-management', { orders });
  } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).send('Server Error');
  }
};

// adminController.js

exports.logout = (req, res) => {
  if (req.session) {
      req.session.destroy((err) => {
          if (err) {
              console.error('Failed to destroy session:', err);
              return res.status(500).send('Failed to log out');
          }
          // Redirect to the login page after logout
          res.redirect('/admin/login');
      });
  } else {
      res.redirect('/admin/login');
  }
};
