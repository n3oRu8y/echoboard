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

        if (!res.ok) {
            const data = await res.json();
            return alert(data.message);
        }

        const redirect = new URLSearchParams(location.search).get("redirect");

        if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
            location.href = redirect;
        } else {
            location.href = "/";
        }
    } catch {
        return alert("인터넷 연결상태를 확인해주세요.");
    }
});