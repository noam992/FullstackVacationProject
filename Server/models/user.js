class User {
    constructor(userId, firstName, lastName, username, password, isAdmin) {
        
        if (userId !== undefined) this.userId = userId;
        if (firstName !== undefined) this.firstName = firstName;
        if (lastName !== undefined) this.lastName = lastName;
        if (username !== undefined) this.username = username;
        if (password !== undefined) this.password = password;
        if (isAdmin !== undefined) this.isAdmin = isAdmin;
    }

};

module.exports = User;