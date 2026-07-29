document.querySelectorAll("#btn-logout").forEach(btn => {
    btn.addEventListener("click", async e => {
        const res = await fetch("/api/auth/logout", { method: "POST" });
        location.reload();
    });
});

const nicknameForm = document.getElementById("nickname-form");
nicknameForm.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(nicknameForm);

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