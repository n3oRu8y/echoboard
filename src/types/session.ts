import "express-session";
import type User from "../domains/user/UserDomain.js";

declare module "express-session" {
    interface SessionData {
        userId: string;
        user: User | null
    }
}