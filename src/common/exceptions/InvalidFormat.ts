export default class InvalidFormat extends Error {
    public constructor(message: string = "Invalid format") {
        super(message);
    }
};