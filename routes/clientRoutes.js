const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/checkBlocked');
const clientController = require('../controllers/clientController');

//product
// router.get('/', productController.getAllProducts);
// router.post('/add', productController.addProduct);
//views
// router.get('/add', productController.getAddProductForm);
router.get('/products',clientController.productsView);

router.get('/home',clientController.getHomePage);

router.get('/aboutUs',clientController.getAboutUs);

router.get('/blog',clientController.getBlog);

router.get('/contactUs',clientController.getContactUs);

router.get('/services',clientController.getServices);

router.get('/product/:id', clientController.getProductDetail);

// Route to display user profile
router.get('/profile',isAuthenticated, clientController.getUserProfile);

router.get('/orders',isAuthenticated,clientController.getOrders);
//home
module.exports = router;