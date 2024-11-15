// controllers/couponController.js
const Coupon = require('../models/coupon');

// Display coupon management page
exports.getCouponManagementPage = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.render('admin/coupon-management', { coupons });
    } catch (error) {
        console.error('Error loading coupons:', error);
        res.status(500).send('Error loading coupon management page');
    }
};

// Create a new coupon
exports.createCoupon = async (req, res) => {
    const { code, discount, expirationDate } = req.body;
    try {
        const newCoupon = new Coupon({
            code,
            discount,
            expirationDate: new Date(expirationDate),
            isActive: true
        });
        await newCoupon.save();
        res.redirect('/admin/coupon-management');
    } catch (error) {
        console.error('Error saving coupon:', error);
        res.status(500).send('Error saving coupon');
    }
};

// Delete a coupon
exports.deleteCoupon = async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.redirect('/admin/coupon-management');
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).send('Error deleting coupon');
    }
};

exports.getEditCouponPage = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).send('Coupon not found');
        }
        res.render('admin/edit-coupon', { coupon });
    } catch (error) {
        console.error('Error loading edit coupon page:', error);
        res.status(500).send('Error loading edit coupon page');
    }
};

exports.updateCoupon = async (req, res) => {
    const { code, discount, expirationDate, isActive } = req.body;
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).send('Coupon not found');
        }

        // Update the coupon details
        coupon.code = code;
        coupon.discount = discount;
        coupon.expirationDate = new Date(expirationDate);
        coupon.isActive = isActive === 'true'; // Convert string to boolean

        await coupon.save();
        res.redirect('/admin/coupon-management');
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).send('Error updating coupon');
    }
};