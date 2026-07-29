document.querySelectorAll("#btn-logout").forEach(btn => {
    btn.addEventListener("click", async e => {
        const res = await fetch("/api/auth/logout", { method: "POST" });
        location.reload();
    });
});