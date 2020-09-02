export class UserModel {

    public constructor(

        public userId?: number,
        public firstName?: string,
        public lastName?: string,
        public username?: string,
        public password?: string,
        public isAdmin?: number)
        { }
        
}
