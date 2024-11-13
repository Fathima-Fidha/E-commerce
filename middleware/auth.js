const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next(); // User is authenticated, proceed to the next middleware/route
    }
    res.redirect('/auth/login'); // Redirect to login if not authenticated
};

module.exports = {isAuthenticated};
