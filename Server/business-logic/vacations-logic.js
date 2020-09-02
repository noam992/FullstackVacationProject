const dal = require("../data-access-layer/dal");


// Get all vacations
async function getVacationsAsync() {
    const sql = `SELECT Vacations.vacationId, Vacations.description, destination.destinationName, Vacations.destinationId, Vacations.img, Vacations.startTime, Vacations.endTime, Vacations.price, COUNT(followVacations.vacationId) AS numFollowers
                    FROM Vacations 
                        JOIN destination 
                            ON Vacations.destinationId = destination.destinationId
                        LEFT JOIN followVacations 
                            ON Vacations.vacationId = followVacations.vacationId
                            GROUP BY Vacations.vacationId`
    const vacations = await dal.executeAsync(sql);
    return vacations;
}


// Add new vacation
async function addVacationAsync(vacation) {

    const sql = `INSERT INTO vacations(description, destinationId, img, startTime, endTime, price) 
            VALUE('${vacation.description}',
                ${vacation.destinationId},
                '${vacation.img}',
                '${vacation.startTime}',
                '${vacation.endTime}',
                ${vacation.price})`
    
    const info = await dal.executeAsync(sql);
    vacation.vacationId = info.insertId
    return vacation;

}


// Update existing vacation
async function updatePartialVacationAsync(vacation) {
    let sql = "UPDATE vacations SET ";
    
    if(vacation.description !== undefined) {
        sql += `description = '${vacation.description}',`;
    }

    if(vacation.destinationId !== undefined) {
        sql += `destinationId = ${vacation.destinationId},`;
    }

    if(vacation.img !== undefined) {
        sql += `img = '${vacation.img}',`;
    }

    if(vacation.startTime !== undefined) {
        sql += `startTime = '${vacation.startTime}',`;
    }

    if(vacation.endTime !== undefined) {
        sql += `endTime = '${vacation.endTime}',`;
    }

    if(vacation.price !== undefined) {
        sql += `price = ${vacation.price},`;
    }

    sql = sql.substr(0, sql.length - 1);

    sql += ` WHERE vacationId = ${vacation.vacationId}`;

    const info = await dal.executeAsync(sql);

    if(info.affectedRows) {
        return vacation;
    }

    return null;
}


// Delete existing vacation 
async function deleteVacationAsync(vacationId) {
    const sqlPK = `DELETE FROM followvacations WHERE vacationID = ${vacationId}`;
    await dal.executeAsync(sqlPK);
    
    const sqlFK = `DELETE FROM Vacations WHERE vacationID = ${vacationId}`;
    await dal.executeAsync(sqlFK);
}



// Session = follow vacations

// Get follow vacations per user
async function getFollowVacationsPerUserAsync(userId) {

    const sql = `SELECT vacationId FROM followVacations WHERE followVacations.userId = ${userId}`
    const followVacationsPerUser = await dal.executeAsync(sql);
    return followVacationsPerUser;

}

// Check if that current follow vacation is exist in DB
async function isFollowVacationExistAsync(followVacation) {

    const sql = `SELECT vacationId FROM followVacations WHERE followVacations.userId = ${followVacation.userId}`
    const followVacationsPerUser = await dal.executeAsync(sql);

    const arrayNum = []
    for (const item of followVacationsPerUser) {
        arrayNum.push(item.vacationId)
    }

    const isFollowExisted = arrayNum.find( f => f === followVacation.vacationId )
    return isFollowExisted;

}


// Add new follow vacation
async function addFollowVacationAsync(followVacation) {

    const sql = `INSERT INTO followVacations(userId, vacationId) VALUE(${followVacation.userId}, ${followVacation.vacationId})`
    const info = await dal.executeAsync(sql);
    followVacation.followVacationId = info.insertId
    return followVacation;

}


// Delete follow vacation
async function deleteFollowVacationAsync(followVacation) {

    const sql = `DELETE FROM followVacations WHERE userId = ${followVacation.userId} AND vacationId = ${followVacation.vacationId}`
    await dal.executeAsync(sql);

}



module.exports = {
    getVacationsAsync,
    addVacationAsync,
    updatePartialVacationAsync,
    deleteVacationAsync,
    getFollowVacationsPerUserAsync,
    isFollowVacationExistAsync,
    addFollowVacationAsync,
    deleteFollowVacationAsync
}