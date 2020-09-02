function isAdmin(request, response, next) {
        
    if (!request.session.user) {
        response.status(401).send("You are not logged in!");
        return;
    }

    if (!request.session.user.isAdmin) {
        response.status(403).send("You are not admin!");
        return;
    }

    next();
}

module.exports = isAdmin;

