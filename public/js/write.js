const segments = window.location.pathname
    .split("/")
    .filter(Boolean);

const boardId = segments[1];

const attachments = [];
const images = [];

const editor = new toastui.Editor({
    el: document.querySelector("#editor"),
    height: "500px",
    initialEditType: "wysiwyg"
});

// 첨부파일 목록 표시
function addAttachment(attachment) {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    const name = document.createElement("span");
    name.textContent = attachment.originalName ?? attachment.fileName;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn btn-sm btn-outline-danger";
    remove.innerHTML = '삭제';

    remove.onclick = () => {
        const index = attachments.findIndex(v => v.id === attachment.id);

        if (index !== -1)
            attachments.splice(index, 1);

        li.remove();
    };

    li.appendChild(name);
    li.appendChild(remove);

    document.getElementById("uploaded").appendChild(li);
}

// 에디터 이미지 업로드
editor.removeHook("addImageBlobHook");

editor.addHook("addImageBlobHook", async (blob, callback) => {

    const formData = new FormData();
    formData.append("image", blob);

    const res = await fetch("/api/attachments/image", {
        method: "POST",
        body: formData
    });

    if (!res.ok) {
        alert("이미지 업로드 실패");
        return;
    }

    const attachment = await res.json();

    // 본문 이미지도 첨부파일로 관리하려면 유지
    images.push(attachment.data);

    callback(attachment.data.url, attachment.data.originalName);
});

// 일반 첨부파일 자동 업로드
document.getElementById("attachment").addEventListener("change", async (e) => {

    const file = e.target.files[0];

    if (!file)
        return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/attachments/file", {
        method: "POST",
        body: formData
    });

    if (!res.ok) {
        alert("파일 업로드 실패");
        return;
    }

    const attachment = await res.json();

    attachments.push(attachment.data);

    addAttachment(attachment.data);

    e.target.value = "";
});

// 게시글 작성
document.getElementById("submit").addEventListener("click", async () => {
    if (attachments.length > 5) return alert("파일 첨부는 5개까지 가능합니다.");

    const body = {
        title: document.getElementById("title").value,
        content: editor.getHTML(),
        attachmentIds: attachments.map(v => v.id),
        imageIds: images.map(v => v.id),
        isAnonymous: document.getElementById("is-anonymous").checked
    };

    console.log(body);

    const res = await fetch(`/api/boards/${boardId}/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        alert("게시글 작성 실패");
        return;
    }

    const result = await res.json();

    console.log(result);

    alert("게시글 작성 완료");
    return location.href = `/boards/${boardId}/${result.data.postId}`;
});