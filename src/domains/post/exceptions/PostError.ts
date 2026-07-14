export default class PostError extends Error {
    constructor(message: string) {
        super(message);
    }
}