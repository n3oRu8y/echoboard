const registerForm = document.getElementById("register-form");

registerForm.addEventListener("submit", async e => {
    e.preventDefault();

    const formData = new FormData(registerForm);

    try {
        const token = hcaptcha.getResponse();
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: formData.get("email")?.toString().trim(),
                username: formData.get("username")?.toString().trim(),
                password: formData.get("password")?.toString().trim(),
                token: token
            })
        });

        if (!res.ok) {
            const data = await res.json();
            return alert(data.message);
        }

        location.href = "/";
    } catch (e) {
        if (e instanceof SyntaxError) {
            return alert("서버 응답 오류");
        }

        alert(e);
    }
});