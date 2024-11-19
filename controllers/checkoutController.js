const crypto = require('crypto');
const Razorpay = require('razorpay');
const Cart = require('../models/cart');
const Order = require('../models/order');
const Product=require('../models/product')



const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.getCheckout = async (req, res) => {
    const userId = req.session.userId;
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    const cartItems = cart ? cart.items : [];
    const discount = req.session.discount || 0;
    const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0) - discount;
  
    res.render('client/checkout', { cartItems, totalAmount });
  };

  exports.placeOrder = async (req, res) => {
    const { fullName, address, city, postalCode, country, paymentMethod } = req.body;
    const userId = req.session.userId;
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart) {
        return res.redirect('/checkout?error=No items in cart.');
    }

    const discount = req.session.discount || 0;
    const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0) - discount;

    if (paymentMethod === 'COD') {
        try {
            const newOrder = new Order({
                userId,
                items: cart.items.map(item => ({
                    productId: item.productId._id,
                    name: item.productId.name,
                    price: item.productId.price,
                    quantity: item.quantity
                })),
                totalAmount,
                shippingAddress: { address, city, postalCode, country },
                paymentMethod,
                paymentStatus: 'Paid'
            });

            await newOrder.save();
            await Cart.findOneAndDelete({ userId });
            req.session.discount = 0;

            for (let item of cart.items) {
                const product = await Product.findById(item.productId._id);
                if (product.stock >= item.quantity) {
                    product.stock -= item.quantity;
                    await product.save();
                } else {
                    return res.redirect(`/checkout?error=${product.name} is out of stock.`);
                }
            }

            return res.redirect('/order-confirmation?success=Order placed successfully.');
        } catch (error) {
            console.error('Order placement error:', error);
            return res.redirect('/checkout?error=Error processing order.');
        }
    } else if (paymentMethod === 'Razorpay') {
        try {
            const options = {
                amount: totalAmount * 100, // Razorpay expects the amount in paise (1 INR = 100 paise)
                currency: 'INR',
                receipt: `order_rcptid_${Date.now()}`,
            };
            const razorpayOrder = await razorpay.orders.create(options);
            
            // Save order details in session to be used after successful payment
            req.session.orderDetails = {
                fullName,
                address,
                city,
                postalCode,
                country,
                paymentMethod,
                razorpayOrderId: razorpayOrder.id,
                totalAmount
            };

            // Render Razorpay payment page
            res.render('client/razorpayPayment', {
                orderId: razorpayOrder.id,
                amount: options.amount,
                currency: options.currency
            });
        } catch (error) {
            console.error('Error creating Razorpay order:', error);
            res.redirect('/checkout?error=Error processing payment.');
        }
    } else {
        res.redirect('/checkout?error=Invalid payment method selected.');
    }
};


  
  exports.orderConfirmation = (req, res) => {
    res.render('client/confirmation');
  };
  
