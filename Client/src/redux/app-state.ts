import { VacationModel } from "../models/vacation-model";
import { UserModel } from "../models/user-model";

export class AppState {
    
    public user: UserModel [];
    public vacations: VacationModel[];

    public constructor() {
        this.user = [];
        this.vacations = [];
    }
}