// adminRoutes.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const Order = require('../models/order'); // Adjust path as needed
const adminMiddleware = require('../middleware/admin'); // Middleware to check admin authentication


const upload = adminController.upload; // For file upload functionality

// Admin login route
router.get('/login', (req, res) => {
    res.render('admin/login');
});
router.post('/login', adminController.postAdminLogin);

// Admin logout route
router.get('/logout', adminController.logout);

// Protected Routes - Apply `adminMiddleware` to secure these routes

// Overview Page
router.get('/overview', adminMiddleware, adminController.getOverview);

// Product Management

// Add New Product
router.get('/add-product', adminMiddleware, adminController.getAddProduct);
router.post('/add-product', adminMiddleware, upload, adminController.addProduct);

// Edit Product
router.get('/edit-product/:id', adminMiddleware, adminController.getEditProduct);
router.post('/edit-product/:id', adminMiddleware, upload, adminController.postEditProduct);

// Delete Product
router.post('/delete-product/:id', adminMiddleware, adminController.postDeleteProduct);

// Product List Page
router.get('/product-list', adminMiddleware, adminController.getProductList);

// Stock Management Page
router.get('/stock', adminMiddleware, adminController.getStock);

// User Management

// User Overview Page
router.get('/userOverview', adminMiddleware, adminController.getUserOverview);

// Block/Unblock User
router.post('/user/:id/block', adminMiddleware, adminController.toggleBlockUser);

// Order Management

// Route for Order Management Page
router.get('/order-management', adminMiddleware, adminController.getOrderManagement);

// Route to get a user's orders
router.get('/user/:id/orders', adminMiddleware, adminController.getUserOrdersPage);

// Route to get specific order details
router.get('/orders/:orderId', adminMiddleware, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId); // Fetch the specific order by ID

        if (!order) {
            return res.status(404).send("Order not found");
        }

        // Render order details page
        res.render('admin/orderDetail', { order });
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Route to update order status
router.post('/orders/:orderId/status', adminMiddleware, adminController.updateOrderStatus);


module.exports = router;
