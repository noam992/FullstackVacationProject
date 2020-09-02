export class VacationModel {

    public constructor(

        public vacationId?: number,
        public description?: string,
        public destinationName?: string,
        public destinationId?: number,
        public img?: File,
        public startTime?: string,
        public endTime?: string,
        public price?: number,
        public numFollowers?: number)
        
        { }
        
}