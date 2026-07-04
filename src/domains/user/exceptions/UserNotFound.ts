import UserException from "./UserException.js";

export default class UserNotFound extends UserException {
    constructor(message: string) {
        super(message);
    }
}