class FollowVacation {
    constructor(followVacationId, userId, vacationId) {
        
        if (followVacationId !== undefined) this.followVacationId = followVacationId;
        if (userId !== undefined) this.userId = userId;
        if (vacationId !== undefined) this.vacationId = vacationId;

    };

};

module.exports = FollowVacation;