let blockMode = false;

function generateSelector(elem) {
    if (elem.id) {
        return `#${elem.id}`;
    }

    if (elem.classList.length > 0) {
        return elem.tagName.toLowerCase() + "." + [...elem.classList].join(".");
    }

    return elem.tagName.toLowerCase();
}

function highlight(e) {
    if (!blockMode) return;
    e.target.style.outline = "2px solid red";
}

function unhighlight(e) {
    if (!blockMode) return;
    e.target.style.outline = "";
}

function blockElement(e) {
    if (!blockMode) return;

    e.preventDefault();
    e.stopPropagation();

    const elem = e.target;
    const selector = generateSelector(elem);
    const domain = location.hostname;

    chrome.storage.local.get([domain], (result) => {
        const blocked = result[domain] || [];
        if (!blocked.includes(selector)) {
            blocked.push(selector);
            chrome.storage.local.set({ [domain]: blocked });
        }
    });

    elem.remove();
}

function applyBlocked() {
    const domain = location.hostname;
    chrome.storage.local.get([domain], (result) => {
        const blocked = result[domain] || [];
        blocked.forEach((sel) => {
            document.querySelectorAll(sel).forEach((el) => el.remove());
        });
    });
}

chrome.storage.local.get("blockMode", (result) => {
    blockMode = result.blockMode || false;
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.blockMode) {
        blockMode = changes.blockMode.newValue;
    }
});

document.addEventListener("mouseover", highlight);
document.addEventListener("mouseout", unhighlight);
document.addEventListener("click", blockElement, true);
window.addEventListener("load", applyBlocked);
