const deleteBtn = document.getElementById("deleteBtn");
deleteBtn?.addEventListener("click", async e => {
    if (!confirm("게시글을 삭제하겠습니까?")) return;
    try {
        const res = await fetch(`/api/boards/${boardUrl}/posts/${postId}`, { method: "DELETE" });
        if (!res.ok) {
            const data = await res.json();
            return alert(data.message);
        }

        alert("게시글이 삭제되었습니다.");
        location.href = `/boards/${boardUrl}`;
    } catch {
        console.log("인터넷 연결 오류");
    }
});

const commentForm = document.getElementById("comment-form");
commentForm.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(commentForm);

    try {
        const res = await fetch(`/api/boards/${boardUrl}/posts/${postId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content: formData.get("content")?.toString().trim(),
                parent: null,
                isAnonymous: formData.has("anonymous")
            })
        });

        if (!res.ok) {
            const data = await res.json();
            return alert(data.message);
        }

        location.reload();
    } catch {
        alert("인터넷 연결 상태를 확인해주세요.");
    }
});

document.querySelectorAll("#delete-comment-btn").forEach(btn => {
    btn.addEventListener("click", async e => {
        if (!confirm("댓글을 삭제하시겠습니까?"))
            return;

        const commentId = btn.dataset.commentId;
        try {
            const res = await fetch(`/api/boards/${boardUrl}/posts/${postId}/comments/${commentId}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                return alert(data.message);
            }
            alert("댓글이 삭제되었습니다.");
            location.reload();
        } catch {
            alert("인터넷 연결 상태를 확인해주세요.");
        }
    });
});

const replyEditor = document.getElementById("reply-editor");
const replyForm = document.getElementById("reply-form");
const commentIdInput = replyForm.querySelector("input[name=commentId]");
const replyTextarea = replyForm.querySelector("textarea");

document.querySelectorAll(".reply-btn").forEach(button => {
    button.addEventListener("click", () => {
        const comment = button.closest(".list-group-item");

        if (
            replyEditor.parentElement === comment &&
            !replyEditor.classList.contains("d-none")
        ) {
            replyEditor.classList.add("d-none");
            replyForm.reset();
            return;
        }

        const replies = comment.querySelector(".replies");

        if (replies) {
            comment.insertBefore(replyEditor, replies);
        } else {
            comment.appendChild(replyEditor);
        }

        commentIdInput.value = button.dataset.commentId;
        replyEditor.classList.remove("d-none");
        replyTextarea.focus();
    });
});

document.getElementById("reply-cancel").addEventListener("click", () => {
    replyEditor.classList.add("d-none");
    replyForm.reset();
});

replyForm.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(replyForm);

    try {
        const res = await fetch(`/api/boards/${boardUrl}/posts/${postId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content: formData.get("content")?.toString().trim(),
                parentId: commentIdInput.value,
                isAnonymous: formData.has("anonymous")
            })
        });

        if (!res.ok) {
            const data = await res.json();
            return alert(data.message);
        }

        location.reload();
    } catch {
        alert("인터넷 연결 상태를 확인해주세요.");
    }
});