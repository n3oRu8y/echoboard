import redisClient from "../../db/redis.js";

export default class AuthService {
    public async SetLoginRateLimit(ip: string) {
        const key = `login:rate:${ip}`;

        const count = await redisClient.incr(key);
        await redisClient.expire(key, 60 * 60);

        return count;
    }

    public async DeleteLoginRateLimit(ip: string) {
        await redisClient.del(`login:rate:${ip}`);
    }

    public async isLocked(ip: string) {
        const count = Number(await redisClient.get(`login:rate:${ip}`));
        return count >= 10;
    }
}