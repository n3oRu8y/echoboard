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
                    secret: formData.get("secret")?.toString().trim(),
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