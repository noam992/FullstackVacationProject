import { AppState } from "./app-state";
import { Action } from "./action";
import { ActionType } from "./action-type";

export function reduce(oldAppState: AppState, action: Action): AppState {

    const newAppState = { ...oldAppState };

    switch(action.type) {

        case ActionType.GetAllVacations:

            newAppState.vacations = action.payload;
            break;

        case ActionType.AddVacation:

            newAppState.vacations.push(action.payload);
            break;

        case ActionType.UpdateVacation:

            let uploadedVacation = action.payload
            let currentVacation = newAppState.vacations.find( v => v.vacationId === uploadedVacation.vacationId);
            let indexOfCurrentVacation = newAppState.vacations.findIndex( v => v.vacationId === uploadedVacation.vacationId);
            
            if (uploadedVacation.description !== undefined) {
                currentVacation.description = uploadedVacation.description
            }

            if (uploadedVacation.destinationName !== undefined) {
                currentVacation.destinationName = uploadedVacation.destinationName
            }

            if (uploadedVacation.destinationId !== undefined) {
                currentVacation.destinationId = uploadedVacation.destinationId
            }

            if (uploadedVacation.img !== undefined) {
                currentVacation.img = uploadedVacation.img
            }

            if (uploadedVacation.startTime !== undefined) {
                currentVacation.startTime = uploadedVacation.startTime
            }     

            if (uploadedVacation.endTime !== undefined) {
                currentVacation.endTime = uploadedVacation.endTime
            }  
            
            if (uploadedVacation.price !== undefined) {
                currentVacation.price = uploadedVacation.price
            }  

            if (uploadedVacation.numFollowers !== undefined) {
                if (uploadedVacation.numFollowers === 1) {
                    currentVacation.numFollowers += 1
                } else {
                    currentVacation.numFollowers -= 1
                }
            }

            newAppState.vacations.splice(indexOfCurrentVacation, 1, currentVacation);
            break;
        
        case ActionType.DeleteVacation:

            let deletedVacationId = action.payload
            let indexOfCurrentDeletedVacation = newAppState.vacations.findIndex( v => v.vacationId === deletedVacationId);

            newAppState.vacations.splice(indexOfCurrentDeletedVacation, 1)
            break;
        
        case ActionType.GetUserDetails:

            newAppState.user.push(action.payload);
            break;

        case ActionType.DeleteUserDetails:
            
            newAppState.user.splice(0, 1)
            break;
        
        default: break;
    }

    return newAppState;
}