import TurnstileFailed from "./exceptions/TurnstileFailed.js";

const TURNSTILE_SECRETKEY = process.env.TURNSTILE_SECRETKEY || "1x0000000000000000000000000000000AA";

export default class TurnstileService {
    public static async Verify(token: string, ip: string) {
        const maxTries = 5;

        for (let i = 0; i < maxTries; i++) {
            try {
                const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: new URLSearchParams({
                        secret: TURNSTILE_SECRETKEY,
                        response: token,
                        remoteip: ip
                    })
                });

                const data = await res.json();

                if (data.success) {
                    return;
                }

                console.log(data["error-codes"]);
                throw new TurnstileFailed("Turnstile failed");
            } catch (e) {
                if (e instanceof TurnstileFailed) {
                    throw e;
                }

                console.log(e);
            }
        }

        throw new TurnstileFailed("Failed to verify Turnstile after maximum retry attempts.");
    }
}