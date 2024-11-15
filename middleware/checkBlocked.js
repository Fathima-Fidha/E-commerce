const User = require('../models/user');

const isAuthenticated = async (req, res, next) => {
    if (req.session.userId) {
        const user = await User.findById(req.session.userId);

        if (user && user.isBlocked) {
            // If user is blocked, destroy the session and prevent access
            req.session.destroy(err => {
                if (err) console.error(err);
                // Send error message to the login page to display in SweetAlert
                return res.render('/auth/login', { error: 'Your account has been blocked.' });
            });
        } else {
            // Attach user to request if authenticated
            req.user = user;
            return next();
        }
    } else {
        res.redirect('/auth/login'); // Redirect to login if not authenticated
    }
};

module.exports = { isAuthenticated };


