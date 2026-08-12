document.querySelectorAll("#two-fa-enable-form").forEach(form => {
    form.addEventListener("submit", async e => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
            const res = await fetch("/api/auth/2fa/enable", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: formData.get("token")?.toString().trim()
                })
            });

            if (!res.ok) {
                const data = await res.json();
                return alert(data.message);
            }

            alert("2단계 인증이 등록되었습니다.");
            return location.href = "/mypage";
        } catch {
            alert("인터넷 연결 상태를 확인해주세요.");
        }
    });
});

document.querySelectorAll("#two-fa-disable-form").forEach(form => {
    form.addEventListener("submit", async e => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
            const res = await fetch("/api/auth/2fa/disable", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: formData.get("token")?.toString().trim()
                })
            });

            if (!res.ok) {
                const data = await res.json();
                return alert(data.message);
            }

            alert("2단계 인증이 해제되었습니다.");
            location.href = "/mypage";
        } catch {
            alert("인터넷 연결 상태를 확인해주세요.");
        }
    });
});

document.querySelectorAll("#two-fa-verify-form").forEach(form => {
    form.addEventListener("submit", async e => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
            const res = await fetch("/api/auth/login/2fa", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: formData.get("token")?.toString().trim(),
                    trustDevice: formData.has("trustDevice")
                })
            });

            if (!res.ok) {
                const data = await res.json();

                const error = document.querySelector("#error-message");
                error.textContent = data.message ?? "인증에 실패했습니다.";
                error.classList.remove("d-none");

                return;
            }

            const redirect = new URLSearchParams(location.search).get("redirect");

            if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
                location.href = redirect;
            } else {
                location.href = "/";
            }
        } catch {
            const error = document.querySelector("#error-message");
            error.textContent = "인터넷 연결 상태를 확인해주세요.";
            error.classList.remove("d-none");
        }
    });
});