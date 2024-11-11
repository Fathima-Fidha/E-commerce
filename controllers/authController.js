const User = require('../models/user');
const { validationResult } = require('express-validator');

exports.getSignup = (req, res) => {
    res.render('client/signup', { error: null });
};

exports.postSignup = async (req, res) => {
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = {};
        errors.array().forEach(error => {
            console.log(error, 'err');
            
            errorMessages[error.path] = error.msg;
        });
        console.log(errors, 'helo');
        
        console.log(errorMessages, 'err message');
        
        return res.render('client/signup', { error: errorMessages });
    }
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.redirect('/auth/login');
    } catch (err) {
        res.render('client/signup', { error: 'Error signing up, please try again.' });
    }
};

exports.getLogin = (req, res) => {
    res.render('client/login', { error: null });
};

exports.postLogin = async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body,'body');
    
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.render('client/login', { error: 'Invalid email or password.' });
        }
        if (user.isBlocked) {
            return res.status(403).json({ message: 'Your account has been blocked. Contact support for assistance.' });
          }

        const isMatch = await user.comparePassword(req.body.password);
        if (!isMatch) {
            return res.render('client/login', { error: 'Invalid email or password.' });
        }

        req.session.userId = user._id;
        req.user=user; // Store user ID in session
        res.redirect('/home');
    } catch (err) {
        res.render('client/login', { error: 'Error logging in, please try again.' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/products');
        }
        res.redirect('/auth/login');
    });
};
