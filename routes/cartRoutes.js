const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const isAuthenticated = require('../middleware/auth');

router.use(isAuthenticated); // Ensure user is authenticated for all cart routes
router.post('/add-to-cart', cartController.addToCart);
router.patch('/update-quantity', cartController.updateQuantity);
router.get('/', cartController.getCart);
router.post('/apply-coupon', cartController.applyCoupon);
module.exports = router;


