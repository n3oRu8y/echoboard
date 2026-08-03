import TOTPException from "./TOTPException.js";

export default class TwoFactorNotEnabled extends TOTPException {
    constructor() {
        super("Two-factor authentication is not enabled.");
    }
}