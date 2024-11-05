const product = require('../models/product');
const Product = require('../models/product');

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