import HCaptchaFailed from "./exceptions/HCaptchaFailed.js";

const HCAPTCHA_SECRET_KEY = process.env.HCAPTCHA_SECRET_KEY || "0x0000000000000000000000000000000000000000";

export default class HCaptchaService {
    public static async Verify(token: string, ip: string) {
        const maxTries = 5;
        for(let i = 0; i < maxTries; i++) {
            try {
                const res = await fetch("https://api.hcaptcha.com/siteverify", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: new URLSearchParams({
                        secret: HCAPTCHA_SECRET_KEY,
                        response: token,
                        remoteip: ip
                    })
                });

                const data = await res.json();
                if (data.success)
                    return;

                console.log(data["error-codes"]);
                throw new HCaptchaFailed("HCaptcha failed");
            } catch (e) {
                if (e instanceof HCaptchaFailed) {
                    throw e;
                }
                console.log(e);
            }
        }

        throw new HCaptchaFailed("Failed to verify hCaptcha after maximum retry attempts.");
    }
}