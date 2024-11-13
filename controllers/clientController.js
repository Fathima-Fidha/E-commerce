const product = require('../models/product');
const Product=require('../models/product');
const User=require('../models/user');
const Order=require('../models/order');
//views
exports.productsView = async (req, res) => {
  const products = await product.find()
  console.log(products);
  
  res.render('client/products',{products})
}

exports.getHomePage = (req,res)=>{
  res.render("client/home");
}

exports.getAboutUs = (req,res)=>{
  res.render("client/aboutUs");
}

exports.getBlog = (req,res)=>{
  res.render("client/blog");
}

exports.getServices = (req,res)=>{
  res.render("client/services");
}

exports.getContactUs = (req,res)=>{
  res.render("client/contactUs");
}


exports.getProductDetail = async (req, res) => {
  try {
  const productId = req.params.id;
  
      const product = await Product.findById(productId);
     
      if (!product) {
          return res.status(404).send("Product not found");
      }
      
      res.render('client/product-detail', { product});
  } catch (err) {
      console.error("Error fetching product details:", err);
      res.status(500).send("Error fetching product details");
  }
};

exports.getUserProfile = async (req, res) => {
  try {
      // The user is already attached to req by the isAuthenticated middleware
      const user = req.user;

      if (!user) {
          return res.status(401).send('User not authenticated');
      }

      // Render profile view with user data
      res.render('client/profile', { user });
  } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).send('Server Error');
  }
};

exports.getOrders = async (req, res) => {
  try {
      // The user is already attached to req by the isAuthenticated middleware
      const user = req.user;

      if (!user) {
          return res.status(401).send('User not authenticated');
      }

      // Fetch orders for the logged-in user
      const orders = await Order.find({ userId: user._id }).populate('items.productId');
      
      // Render orders view with the orders data
      res.render('client/orders', { orders });
  } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).send('Server Error');
  }
};