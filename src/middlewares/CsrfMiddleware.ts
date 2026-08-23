import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function TokensMatch(expected: string, received: unknown): boolean {
    if (typeof received !== "string") return false;

    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(received);
    return expectedBuffer.length === receivedBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export default function CsrfMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString("base64url");
    }

    res.locals.csrfToken = req.session.csrfToken;

    if (SAFE_METHODS.has(req.method)) {
        return next();
    }

    const received = req.get("X-CSRF-Token") ?? req.body?._csrf;
    if (!TokensMatch(req.session.csrfToken, received)) {
        return res.status(403).json({
            status: "error",
            message: "유효하지 않은 CSRF 토큰입니다. 페이지를 새로고침해주세요."
        });
    }

    next();
}
