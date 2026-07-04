import type { NextFunction, Request, Response } from "express";
import UserService from "../domains/user/UserService.js";
import UserRepo from "../domains/user/UserRepository.js";

export default async function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.session?.userId) {
        const userService = new UserService(new UserRepo());
        const valid = userService.CheckUserId(req.session.userId);
        if (!valid) {
            await new Promise<void>((resolve, reject) => {
                req.session.destroy((err) => {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        }
    }
    
    return next();
}