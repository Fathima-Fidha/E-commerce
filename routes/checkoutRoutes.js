const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const {verifyPayment}=require('../middleware/payment')
const {isAuthenticated} = require('../middleware/checkBlocked');
// Display checkout page
router.get('/checkout',isAuthenticated, checkoutController.getCheckout);

// Process checkout
router.post('/place-order', checkoutController.placeOrder);

router.get('/order-confirmation', checkoutController.orderConfirmation); // Order confirmation page

// Success page after order confirmation
router.get('/success', checkoutController.orderConfirmation);

module.exports = router;
