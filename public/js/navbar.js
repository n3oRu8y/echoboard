document.getElementById("logout-button").addEventListener("click", async e => {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    location.reload();
})