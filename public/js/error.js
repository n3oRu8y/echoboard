document.querySelectorAll(".btn-back").forEach(btn => {
    btn.addEventListener("click", () => {
        history.back();
    });
});