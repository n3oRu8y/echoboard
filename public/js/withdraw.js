document.querySelectorAll("#withdraw-form").forEach(form => {
    form.addEventListener("submit", async e => {
        e.preventDefault();
        const formData = new FormData(form);

        if (!formData.has("agree"))
            return;

        if (!confirm("정말로 회원탈퇴를 하시겠습니까?"))
            return;

        try {
            const res = await fetch("/api/users/me", { 
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    password: formData.get("password")?.toString().trim()
                })
            });

            if (!res.ok) {
                const data = await res.json();
                return alert(data.message);
            }

            alert("회원탈퇴가 완료되었습니다.");
            return location.href="/";
        } catch {
            return alert("인터넷 연결 상태를 확인해주세요.");
        }
    });
});