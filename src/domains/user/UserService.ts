import argon2 from "argon2";
import type UserRepo from "./UserRepository.js";
import UserNotFound from "./exceptions/UserNotFound.js";
import CredentialFailed from "../../common/exceptions/CredentialFailed.js";
import User from "./UserDomain.js";

export default class UserService {
    constructor(private readonly repo: UserRepo) {}

    private async VerifyPassword(password: string, hashed: string) {
        return await argon2.verify(hashed, password);
    }

    public async CheckUserId(userId: string) {
        return !!(await this.repo.FindByUserId(userId));
    }

    public async Register(username: string, password: string, email: string) {
        const hashed = await argon2.hash(password);
        const user = User.Create(username, hashed, email);
        return await this.repo.Create(user);
    }

    public async Login(username: string, password: string) {
        const user = await this.repo.FindByUsername(username);
        if (!user) {
            return false;
        }

        const verified = await this.VerifyPassword(password, user.password);
        if (!verified) {
            return false;
        }

        return true;
    }

    public async GetUserIdWithUsername(username: string) {
        const user = await this.repo.FindByUsername(username);
        if (!user) {
            throw new UserNotFound(`Could not find a user with the username ${username}.`);
        }

        return user.id;
    }

    public async GetUserWithUserId(userId: string): Promise<User>
    public async GetUserWithUserId(userId: string, silent: false): Promise<User>
    public async GetUserWithUserId(userId: string, silent: true): Promise<User | null>

    public async GetUserWithUserId(userId: string, silent: boolean = false) {
        const user = await this.repo.FindByUserId(userId);
        if (!user && !silent) {
            throw new UserNotFound(`Could not find a user with the id ${userId}.`);
        }

        return user;
    }

    public async Withraw(userId: string, password: string) {
        const user = await this.repo.FindByUsername(userId);
        if (!user) {
            throw new UserNotFound(`User with ${userId} is not found`);
        }

        const verified = await this.VerifyPassword(password, user.password);
        if (!verified) {
            throw new CredentialFailed("Invalid password");
        }

        const now = new Date();
        user.deletedAt = now;
        await this.repo.Update(userId, user);
    }

    public async ChangeNickname(userId: string, nickname: string) {
        const user = await this.repo.FindByUserId(userId);
        if (!user) {
            throw new UserNotFound(`User with ${userId} is not found`);
        }

        user.SetNickname(nickname);
        await this.repo.Update(userId, user);
    }

    public async ChangePassword(userId: string, newPassword: string, oldPassword: string | null, skipVerfiy: boolean = false) {
        const user = await this.repo.FindByUserId(userId);
        if (!user) {
            throw new UserNotFound(`User with ${userId} is not found`);
        }

        if (!skipVerfiy) {
            if (!oldPassword) {
                throw new Error("Parameter error");
            }

            const verify = await this.VerifyPassword(oldPassword, user.password);
            if (!verify) {
                throw new CredentialFailed("Credential failed.");
            }
        }

        user.password = await argon2.hash(newPassword);
        await this.repo.Update(userId, user);
    }
}