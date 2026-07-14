import PostError from "./PostError.js";

export default class PostNotFound extends PostError {
    constructor(message: string) {
        super(message);
    }
}