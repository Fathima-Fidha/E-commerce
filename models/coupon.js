// coupon.js

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    discount: { type: Number, required: true, min: 0, max: 100 }, // Percentage discount
    expirationDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Coupon', couponSchema);
