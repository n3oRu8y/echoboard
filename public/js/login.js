const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async e => {
    e.preventDefault();

    const formData = new FormData(loginForm);

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "username": formData.get("username")?.toString().trim(),
                "password": formData.get("password")?.toString().trim()
            })
        });

        const data = await res.json();

        if (!res.ok) {
            return alert(data.message);
        }

        const redirect = new URLSearchParams(location.search).get("redirect");

        if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
            if (data.message == "pending")
                return location.href = `/login/2fa?redirect=${redirect}`;
            location.href = redirect;
        } else {
            if (data.message == "pending")
                return location.href = "/login/2fa";
            location.href = "/";
        }
    } catch {
        return alert("인터넷 연결상태를 확인해주세요.");
    }
});