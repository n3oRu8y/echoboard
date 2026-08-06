import ReactionError from "./ReactionError.js";

export default class ReactionNotFound extends ReactionError {
    public constructor(message: string) {
        super(message);
    }
};