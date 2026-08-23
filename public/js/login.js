const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async e => {
    e.preventDefault();

    const formData = new FormData(loginForm);

    const token = await RenderTurnstile();
    if (!token) {
        alert("Turnstile 검증 실패");
    }

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "username": formData.get("username")?.toString().trim(),
                "password": formData.get("password")?.toString().trim(),
                token: token
            })
        });

        const data = await res.json();

        if (!res.ok) {
            return alert(data.message);
        }

        const value = new URLSearchParams(location.search).get("redirect");
        const redirect = value && URL.canParse(value, location.origin) ? new URL(value, location.origin) : null;
        const target = redirect?.origin === location.origin ? `${redirect.pathname}${redirect.search}${redirect.hash}` : "/";

        if (data.message == "pending")
            return location.href = `/login/2fa?redirect=${encodeURIComponent(target)}`;
        location.href = target;
    } catch {
        return alert("인터넷 연결상태를 확인해주세요.");
    }
});
