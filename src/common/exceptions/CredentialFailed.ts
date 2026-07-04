export default class CredentialFailed extends Error {
    constructor(message: string) {
        super(message);
    }
}