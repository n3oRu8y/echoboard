import UserException from "./UserException.js";

export default class DuplicateUserData extends UserException {
    constructor(message: string) {
        super(message);
    }
}