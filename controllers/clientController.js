const product = require('../models/product');
const Product=require('../models/product')
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