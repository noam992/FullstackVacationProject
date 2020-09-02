const dal = require("../data-access-layer/dal");

async function register(user) {
    const sql = `INSERT INTO Users VALUES(
        DEFAULT,
        '${user.firstName}',
        '${user.lastName}',
        '${user.username}',
        '${user.password}',
        0)`; // 0 = Not Admin

    const info = await dal.executeAsync(sql);
    user.userId = info.insertId;
    return user;
}

async function isRegistered(credentials) {
    const sql = `SELECT * FROM Users
        WHERE username = '${credentials.username}'`;
    const user = await dal.executeAsync(sql);
    return user;
}

async function login(credentials) {
    const sql = `SELECT * FROM Users
        WHERE username = '${credentials.username}'
        AND password = '${credentials.password}'`;
    const users = await dal.executeAsync(sql);
    const user = users[0];
    return user;
}

module.exports = {
    register,
    login,
    isRegistered
};