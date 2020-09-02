class Vacation {
    
    constructor(vacationId, description, destinationId, img, startTime, endTime, price) {
        
        if (vacationId !== undefined) this.vacationId = vacationId;
        if (description !== undefined) this.description = description;
        if (destinationId !== undefined) this.destinationId = destinationId;
        if (img !== undefined) this.img = img;
        if (startTime !== undefined) this.startTime = startTime;
        if (endTime !== undefined) this.endTime = endTime;
        if (price !== undefined) this.price = price;
    
    };

};

module.exports = Vacation;