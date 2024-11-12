function checkBlocked(req, res, next) {
    if (req.isAuthenticated() && req.user.isBlocked) {
        return res.status(403).send('Your account is blocked. You cannot perform this action.');
    }
    next();
}

module.exports = checkBlocked;
