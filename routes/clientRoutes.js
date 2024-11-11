const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const isAuthenticated =require('../middleware/auth')

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
router.get('/', isAuthenticated, clientController.getUserProfile);

router.get('/orders',clientController.getOrders)
//home
module.exports = router;