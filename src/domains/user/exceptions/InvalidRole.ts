import UserException from "./UserException.js";

export class InvalidRole extends UserException {
    public constructor() {
        super("Role must be USER or ADMIN.");
    }
};
