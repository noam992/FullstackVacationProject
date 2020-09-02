const express = require("express");
const authLogic = require("../business-logic/auth-logic");
const User = require("../models/user");
const Joi = require("joi");
const router = express.Router();

router.post("/register", async (request, response) => {
    try {
        const user = new User(
            0, // userId
            request.body.firstName,
            request.body.lastName,
            request.body.username,
            request.body.password,
            0); // isAdmin
        
        // Validate follow vacation data:
        const schemaUser = {
            userId: Joi.optional(),
            firstName: Joi.string().min(1).max(30).required(),
            lastName: Joi.string().min(1).max(30).required(),
            username: Joi.string().min(1).max(30).required(),
            password: Joi.string().min(1).max(30).required(),
            isAdmin: Joi.optional(),
        };

        const result = Joi.validate(user, schemaUser)
        if (result.error) {
            response.status(400).send(result.error)
        }
        
        // if username already exist - return some error (400) to the client...
        const isExistUser = await authLogic.isRegistered(user)
        if (Array.isArray(isExistUser) && isExistUser.length === 1) {
            response.status(400).send(isExistUser)
        }
        
        else {
 
            const addedUser = await authLogic.register(user);

            // Save that user in the session: 
            request.session.user = addedUser;

            response.status(201).json(addedUser);

        }
    }
    catch (err) {
        response.status(500).send(err.message);
    }
});

router.post("/login", async (request, response) => {
    try {
        const credentials = request.body;
        const userLogIn = await authLogic.login(credentials);
        if (!userLogIn) {
            response.status(401).send("Illegal username or password");
            return;
        }

        // Save that user in the session: 
        request.session.user = userLogIn;

        response.json(userLogIn);
    }
    catch (err) {
        response.status(500).send(err.message);
    }
});

router.post("/logout", (request, response) => {
    try {
        request.session.destroy();
        response.end()       
    }
    catch (err) {
        response.status(500).send(err.message);
    }
});

module.exports = router;