const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const Order = require('../models/order'); // Adjust path as needed

const upload = adminController.upload;


// Admin login route
router.get('/login', (req, res) => {res.render('admin/login')});
router.post('/login', adminController.postAdminLogin);


// Get Overview
router.get('/overview', adminController.getOverview);
// Add New Product
router.get('/add-product', adminController.getAddProduct);
router.post('/add-product', adminController.upload, adminController.addProduct);


// Edit Product
router.get('/edit-product/:id', adminController.getEditProduct);
router.post('/edit-product/:id', upload, adminController.postEditProduct);

// Delete Product
router.post('/delete-product/:id', adminController.postDeleteProduct);

// Product List
router.get('/product-list', adminController.getProductList);

// Stock
router.get('/stock', adminController.getStock);


router.get('/logout', adminController.logout);

router.get('/userOverview',adminController.getUserOverview);
router.post('/user/:id/block', adminController.toggleBlockUser);



// Route to get a user's orders
router.get('/user/:id/orders', adminController.getUserOrdersPage);

// Route to get specific order details
router.get('/orders/:orderId', async (req, res) => {
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

router.post('/orders/:orderId/status', adminController.updateOrderStatus);

module.exports = router;