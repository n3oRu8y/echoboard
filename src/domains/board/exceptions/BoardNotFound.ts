import BoardError from "./BoardError.js";

export default class BoardNotFound extends BoardError {
    constructor(message: string) {
        super(message);
    }
}