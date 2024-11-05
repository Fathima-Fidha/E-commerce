const Cart = require('../models/cart');
const Product = require('../models/product');
const Coupon=require('../models/coupon')

exports.addToCart = async (req, res) => {
  const { productId } = req.body;
  console.log('Product ID:', productId);
  const userId = req.session.userId;
  console.log('User ID:', userId);
  try {
      // Find the product by its ID
      const product = await Product.findById(productId);
      if (!product) {
          return res.status(404).json({ message: 'Product not found.' });
      }

      let cart = await Cart.findOne({ userId });
      if (!cart) {
          cart = new Cart({ userId, items: [] });
      }

      // Check if the item is already in the cart
      const existingItem = cart.items.find(item => item.productId.toString() === productId);
      if (existingItem) {
          existingItem.quantity++;
      } else {
          // Add new item with required fields
          cart.items.push({
              productId,
              quantity: 1,
              price: product.price,   // Add product price
              image: product.image,   // Add product image
              name: product.name       // Add product name
          });
      }

    await cart.save().catch(err => {
      console.error('Error saving cart:', err)
    });;
      res.status(200).json({ message: 'Item added to cart successfully!' });
  } catch (err) {
      console.error('Error adding item to cart:', err);
      res.status(500).json({ message: 'Error adding item to cart.' });
  }
};
exports.getCart = async (req, res) => {
    const userId = req.session.userId;
    try {
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        res.render('client/cart', { cartItems: cart ? cart.items : [] });
    } catch (err) {
        res.render('client/cart', { cartItems: [] });
    }
};
exports.updateQuantity = async (req, res) => {
    const { productId, action } = req.body;
    const userId = req.session.userId;

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found.' });
        }

        const item = cart.items.find(item => item.productId.toString() === productId);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found in cart.' });
        }

        // Update quantity based on action
        if (action === 'increment') {
            item.quantity++;
        } else if (action === 'decrement' && item.quantity > 1) {
            item.quantity--;
        } else if (action === 'decrement' && item.quantity === 1) {
            // Remove the item if quantity is 1 and 'decrement' is clicked
            cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        }

        await cart.save();

        // Recalculate subtotal and total after update
        const subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

        res.status(200).json({
            success: true,
            newQuantity: item.quantity,
            subtotal: subtotal.toFixed(2),
            finalTotal: subtotal.toFixed(2) // Assuming no additional fees or taxes
        });
    } catch (err) {
        console.error('Error updating cart quantity:', err);
        res.status(500).json({ success: false, message: 'Error updating cart.' });
    }
};


exports.applyCoupon = async (req, res) => {
    const { couponCode } = req.body;
    const userId = req.session.userId;

    if (!couponCode) {
        return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    try {
        // Find the coupon in the database
        const coupon = await Coupon.findOne({
            code: couponCode.toUpperCase(),
            isActive: true,
            expirationDate: { $gte: new Date() }
        });

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Invalid or expired coupon.' });
        }

        // Check if the coupon has already been applied
        if (req.session.appliedCoupon && req.session.appliedCoupon === coupon.code) {
            return res.status(400).json({ success: false, message: 'Coupon already applied.' });
        }

        // Get the user's cart
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Your cart is empty.' });
        }

        // Calculate subtotal
        const subtotal = cart.items.reduce((total, item) => total + (item.productId.price * item.quantity), 0);

        // Calculate discount
        const discountAmount = (subtotal * coupon.discount) / 100;
        const totalAfterDiscount = subtotal - discountAmount;

        // Store the discount and applied coupon in session
        req.session.discount = discountAmount;
        req.session.appliedCoupon = coupon.code;

        res.status(200).json({
            success: true,
            discount: discountAmount,
            newTotal: totalAfterDiscount
        });
    } catch (err) {
        console.error('Error applying coupon:', err);
        res.status(500).json({ success: false, message: 'Error applying coupon.' });
    }
};
