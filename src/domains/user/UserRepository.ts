import prisma from "../../db/prisma.js";
import User, { Role as DomainRole } from "./UserDomain.js";
import { Role } from "../../generated/prisma/enums.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import DuplicateUserData from "./exceptions/DuplicateUserData.js";

export default class UserRepo {
    private ToPrismaRole(role: DomainRole) {
        switch (role) {
            case (DomainRole.USER): return Role.USER;
            case (DomainRole.ADMIN): return Role.ADMIN;
        }
    }

    async Create(user: User): Promise<User> {
        try {
            const saved = await prisma.user.create({
                data: {
                    username: user.username,
                    email: user.email,
                    password: user.password,
                    createdAt: user.createdAt
                }
            });
            
            return User.FromRow(saved);
        } catch (e) {
            if (e instanceof PrismaClientKnownRequestError) {
                if (e.code == "P2002") {
                    const target = e.meta?.target as Array<string>[0];
                    throw new DuplicateUserData(target);
                }
            }
            throw e;
        }
    }

    async Update(userId: string, user: User) {
        try {
            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    password: user.password,
                    email: user.email,
                    nickname: user.nickname,
                    role: this.ToPrismaRole(user.role),
                    bannedUntil: user.bannedUntil,
                    banReason: user.banReason,
                    twoFactorEnabled: user.twoFactorEnabled,
                    twoFactorSecret: user.twoFactorSecret,
                    lastLoginAt: user.lastLoginAt,
                    deletedAt: user.deletedAt
                }
            });
        } catch (e) {
            if (e instanceof PrismaClientKnownRequestError) {
                if (e.code == "P2002") {
                    const target = e.meta?.target as Array<string>[0];
                    throw new DuplicateUserData(target);
                }
                throw e;
            }
        }
    }

    async FindByUsername(username: string): Promise<User | null> {
        const row = await prisma.user.findFirst({
            where: {
                username: username
            }
        });
        return row ? User.FromRow(row) : null;
    }

    async FindByUserId(userId: string): Promise<User | null> {
        const row = await prisma.user.findFirst({
            where: {
                id: userId
            }
        });
        return row ? User.FromRow(row) : null;
    }
}