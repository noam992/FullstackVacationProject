const dal = require("../data-access-layer/dal");

// Get all destinations
async function getDestinationsAsync() {
    const sql = `SELECT * FROM destination`
    const destinations = await dal.executeAsync(sql);
    return destinations;
}

module.exports = {
    getDestinationsAsync
}