export default class UserException extends Error {
    constructor(message: string) {
        super(message);
    }
}