const roleBasedAccessControl = (req, res, next) => {
    const { roles } = req.user; // Extract roles from the authenticated user

    req.hasRole = (role) => roles.includes(role);

    next();
};

module.exports = { roleBasedAccessControl };
