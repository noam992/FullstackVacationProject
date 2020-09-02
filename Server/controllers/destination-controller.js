const express = require("express");
const destinationLogic = require("../business-logic/destination-logic");
const router = express.Router();


// Get all destination
router.get("/", async (request, response) => {
    try {
        const destinations = await destinationLogic.getDestinationsAsync();
        response.send(destinations);
    }
    catch (err) {
        response.status(500).send(err.message);
    }
});

module.exports = router;