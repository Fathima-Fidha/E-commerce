const express = require('express');
const router = express.Router();
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
//home
module.exports = router;