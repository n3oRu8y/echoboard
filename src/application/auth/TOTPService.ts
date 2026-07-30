import { generateSecret, generateURI, verify } from "otplib";

import type UserRepo from "../../domains/user/UserRepository.js";
import UserNotFound from "../../domains/user/exceptions/UserNotFound.js";
import CredentialFailed from "../../common/exceptions/CredentialFailed.js";
import ValidationException from "../../common/exceptions/ValidationException.js";

export class TOTPResult {
    public secret: string;
    public uri: string;

    public constructor(secret: string, uri: string) {
        this.secret = secret;
        this.uri = uri;
    }
}

export default class TOTPService {
    constructor(private userRepo: UserRepo) {};

    public async CreateSecret(userId: string, email: string) {
        const secret = generateSecret();
        const uri = generateURI({
            issuer: "EchoBoard",
            label: email,
            secret: secret
        });

        return new TOTPResult(secret, uri);
    }

    public async Verify(userId: string, token: string) {
        const user = await this.userRepo.FindByUserId(userId);
        if (!user) {
            throw new UserNotFound(`User with ${userId} is not found`);
        }

        if (!/^\d{6}$/.test(token)) {
            return false;
        }
        
        return (await verify({
            secret: user.twoFactorSecret!,
            token: token
        })).valid;
    }

    public async Enable(userId: string, secret: string, token: string) {
        const user = await this.userRepo.FindByUserId(userId);
        if (!user) {
            throw new UserNotFound(`User with ${userId} is not found`);
        }

        if (!/^\d{6}$/.test(token)) {
            throw new CredentialFailed("Credential failed");
        }

        const verified = await verify({ secret: secret, token: token });
        if (!verified.valid) {
            throw new CredentialFailed("Credential failed");
        }

        user.twoFactorSecret = secret;
        user.twoFactorEnabled = true;

        await this.userRepo.Update(userId, user);
    }

    public async Disable(userId: string, token: string) {
        const user = await this.userRepo.FindByUserId(userId);
        if (!user) {
            throw new UserNotFound(`User with ${userId} is not found`);
        }

        const verified = await this.Verify(userId, token);
        if (!verified) {
            throw new CredentialFailed("Credential failed");
        }

        user.twoFactorEnabled = false;
        user.twoFactorSecret = null;

        await this.userRepo.Update(userId, user);
    }
};