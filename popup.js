const toggleBtn = document.getElementById("toggle");

toggleBtn.addEventListener("click", () => {
    chrome.storage.local.get("blockMode", (data) => {
        const newMode = !data.blockMode;
        chrome.storage.local.set({ blockMode: newMode });
    });
});
