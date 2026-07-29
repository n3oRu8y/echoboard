document.querySelectorAll("#btn-logout").forEach(btn => {
    btn.addEventListener("click", async e => {
        const res = await fetch("/api/auth/logout", { method: "POST" });
        location.reload();
    });
});

document.querySelectorAll("#nickname-form").forEach(form => {
    form.addEventListener("submit", async e => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
            const res = await fetch("/api/users/me", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nickname: formData.get("nickname")?.toString().trim()
                })
            });

            if (!res.ok) {
                const data = await res.json();
                return alert(data.message);
            }

            return location.href = "/mypage";
        } catch {
            alert("인터넷 연결 상태를 확인해주세요.");
        }
    });
});

document.querySelectorAll("#password-form").forEach(form => {
    form.addEventListener("submit", async e => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
            const res = await fetch("/api/users/me", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    password: formData.get("newPassword")?.toString().trim(),
                    oldPassword: formData.get("currentPassword").toString().trim()
                })
            });
            
            if (!res.ok) {
                const data = await res.json();
                return alert(data.message);
            }

            alert("비밀번호가 변경되었습니다.");
            location.href = "/mypage";
        } catch {
            alert("인터넷 연결 상태를 확인해주세요.");
        }
    });
});