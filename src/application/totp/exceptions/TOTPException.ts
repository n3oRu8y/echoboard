export default class TOTPException extends Error {
    constructor(message: string) {
        super(message);
    }
}