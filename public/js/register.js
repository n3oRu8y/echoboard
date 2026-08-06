const registerForm = document.getElementById("register-form");

registerForm.addEventListener("submit", async e => {
    e.preventDefault();

    const formData = new FormData(registerForm);
    if (formData.get("password")?.toString().trim() != formData.get("confirm-password")?.toString().trim()) {
        return alert("비밀번호가 일치하지 않습니다.");
    }

    try {
        const token = hcaptcha.getResponse();
        if (!token) {
            return alert("캡챠를 진행해주세요.");
        }
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

        alert("회원가입이 완료되었습니다.");
        location.href = "/login";
    } catch (e) {
        if (e instanceof SyntaxError) {
            return alert("서버 응답 오류");
        }

        alert(e);
    }
});