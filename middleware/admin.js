module.exports = (req, res, next) => {
    // Check if the admin is authenticated
    if (req.session && req.session.isAuthenticated) {
        return next(); // Allow access to the next route handler
    } else {
        // Redirect to login page if not authenticated
        res.redirect('/admin/login');
    }
};