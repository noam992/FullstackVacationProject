const express = require("express");
const vacationsLogic = require("../business-logic/vacations-logic");
const FollowVacation = require("../models/follow-vacation");
const Vacation = require("../models/vacation");
const isLoggedIn = require("../middleware/is-logged-in");
const isAdmin = require("../middleware/is-admin");
const uuid = require("uuid");
const router = express.Router();
const Joi = require("joi");
global.socketServer = require("socket.io")


// Get all vacations - Open for everyone
router.get("/vacations", async (request, response) => {
    try {
        const vacations = await vacationsLogic.getVacationsAsync();
        response.send(vacations);
    }
    catch (err) {
        response.status(500).send(err.message);
    }
});


// Add new vacation - Open for admin only 
router.post("/vacations", isAdmin, async (request, response) => {
    try {

        // Insert request post into modal
        const image = request.files.img;


        // validation and save file
        if(!request.files) {
            response.status(400).send("No file sent");
            return;
        }

        const extension = image.name.substr(image.name.lastIndexOf(".")); // e.g: ".jpg"
    
        if(extension != ".jpg" && extension != ".png" && extension != ".gif") {
            response.status(400).send("Illegal file sent");
            return;
        }
    
        const newFileName = uuid.v4() + extension;
        image.mv("./uploads/" + newFileName);


        const destination = parseInt(request.body.destinationId);
        const price = parseInt(request.body.price);

        const vacation = new Vacation(
            0,
            request.body.description,
            destination,
            newFileName,
            request.body.startTime,
            request.body.endTime,
            price
        );


        // Validate vacation data: 
        const schemaPost = {
            vacationId: Joi.optional(),
            description: Joi.string().required().min(1).max(2000),
            destinationId: Joi.number().required().min(0).max(1000),
            img: Joi.string().required(),
            startTime: Joi.string().required().min(0).max(10000),
            endTime: Joi.string().required().min(0).max(10000),
            price: Joi.number().required().min(0).max(10000)
        };

        const result = Joi.validate(vacation, schemaPost)
        if (result.error) {
            response.status(400).send(result.error);
            return;
        }

        const addedVacation = await vacationsLogic.addVacationAsync(vacation);
        response.status(200).json(addedVacation);

        // Send update immediately through socket
        const vacations = await vacationsLogic.getVacationsAsync()
        global.socketServer.sockets.emit("admin-change", vacations);

    }
    catch (err) {
        response.status(500).send(err.message);
    }
});


// Patch vacation - Open for admin only
router.patch("/vacations/:vacationId", isAdmin, async (request, response) => {
    try {
        const vacationId = +request.params.vacationId;
        let newFileName = undefined
        let destination = undefined
        let price = undefined

        // Validate user data: 
        if (request.files) {
            const image = request.files.img
            const extension = image.name.substr(image.name.lastIndexOf(".")); // e.g: ".jpg"
    
            if(extension != ".jpg" && extension != ".png" && extension != ".gif") {
                response.status(400).send("Illegal file sent");
                return;
            }
        
            newFileName = uuid.v4() + extension;
            image.mv("./uploads/" + newFileName);
        }

        if (request.body.destinationId) {
            destination = parseInt(request.body.destinationId)
        }
        if (request.body.price) {
            price = parseInt(request.body.price)
        }
        
        const vacation = new Vacation(
            vacationId,
            request.body.description,
            destination,
            newFileName,
            request.body.startTime,
            request.body.endTime,
            price
        );

        // Validate vacation data: 
        const schemaPatch = {
            vacationId: Joi.number().min(0).optional(),
            description: Joi.string().min(0).max(2000).optional(),
            destinationId: Joi.number().min(0).max(1000).optional(),
            img: Joi.string().optional(),
            startTime: Joi.string().min(0).max(10000).optional(),
            endTime: Joi.string().min(0).max(10000).optional(),
            price: Joi.number().min(0).max(10000).optional()
        };

        const result = Joi.validate(vacation, schemaPatch)
        if (result.error) {
            response.status(400).send(result.error);
            return;
        }

        const updatedVacation = await vacationsLogic.updatePartialVacationAsync(vacation);

        if (!updatedVacation) {
            response.sendStatus(404);
            return;
        }

        response.json(updatedVacation);

        // Send update immediately through socket
        const vacations = await vacationsLogic.getVacationsAsync()
        global.socketServer.sockets.emit("admin-change", vacations);
                
    }
    catch (err) {
        response.status(500).send(err.message);
    }
});


// Delete vacation - Open for admin only
router.delete("/vacations/:vacationId", isAdmin, async (request, response) => {
    try {
        const vacationId = +request.params.vacationId;
        await vacationsLogic.deleteVacationAsync(vacationId);
        response.sendStatus(204);

        // Send update immediately through socket
        const vacations = await vacationsLogic.getVacationsAsync()
        global.socketServer.sockets.emit("admin-change", vacations);        

    }
    catch (err) {
        response.status(500).send(err.message);
    }
});



// Session = follow vacations

// Get follow vacations per user - Open for user log in => isLoggedIn,
router.get("/vacations/follow/:user", isLoggedIn, async (request, response) => {
    try {
        const user = request.params.user
        const vacationsOfCurrentUser = await vacationsLogic.getFollowVacationsPerUserAsync(user);
        response.send(vacationsOfCurrentUser);
    }
    catch (err) {
        response.status(500).send(err.message);
    }
});


// Add / Delete follow user from specific vacation - Open for user log in
router.post("/vacations/follow", isLoggedIn, async (request, response) => {
    try {
        const followVacation = new FollowVacation(
            0, // followVacationId
            request.body.userId,
            request.body.vacationId
        );

        // Validate vacation data: 
        const schemaPostFollow = {
            followVacationId: Joi.optional(),
            userId: Joi.number().required().min(0),
            vacationId: Joi.number().required().min(0)
        };

        const result = Joi.validate(followVacation, schemaPostFollow)
        if (result.error) {
            response.status(400).send(result.error);
            return;
        }

        const isFollowExisted = await vacationsLogic.isFollowVacationExistAsync(followVacation);
        
        if (isFollowExisted === undefined) {

            const addedFollowVacation = await vacationsLogic.addFollowVacationAsync(followVacation);
            response.status(200).json(addedFollowVacation);

        } else {
        
            await vacationsLogic.deleteFollowVacationAsync(followVacation);
            response.sendStatus(204)

        }

        // Send update immediately through socket
        const vacations = await vacationsLogic.getVacationsAsync()
        global.socketServer.sockets.emit("admin-change", vacations);
    
    }
    catch (err) {
        response.status(500).send(err.message);
    }
});


module.exports = router;