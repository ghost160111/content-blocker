const toggleBtn = document.getElementById("toggle");
const list = document.getElementById("blockedList");

function setToggleUI(enabled) {
    toggleBtn.textContent = enabled ? "Block Mode: ON" : "Block Mode: OFF";
    toggleBtn.dataset.enabled = String(!!enabled);
}

chrome.storage.local.get("blockMode", ({ blockMode }) => setToggleUI(!!blockMode));

toggleBtn.addEventListener("click", () => {
    const newMode = toggleBtn.dataset.enabled !== "true";
    chrome.storage.local.set({ blockMode: newMode }, () => setToggleUI(newMode));
});

function createItem(domain, selector, index, afterUpdate) {
    const li = document.createElement("li");
    li.className = "item";

    const span = document.createElement("span");
    span.className = "grow";
    span.textContent = selector;

    const del = document.createElement("button");
    del.className = "small";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
        chrome.storage.local.get([domain], (res) => {
            const arr = (res[domain] || []).slice();
            arr.splice(index, 1);
            chrome.storage.local.set({ [domain]: arr }, afterUpdate);
        });
    });

    li.appendChild(span);
    li.appendChild(del);
    return li;
}

function renderDomain(domain) {
    chrome.storage.local.get([domain], (res) => {
        const blocked = res[domain] || [];
        list.innerHTML = "";

        if (blocked.length === 0) {
            const li = document.createElement("li");
            li.textContent = "No blocked elements yet for this domain.";
            list.appendChild(li);
            return;
        }

        blocked.forEach((sel, i) => {
            list.appendChild(createItem(domain, sel, i, () => renderDomain(domain)));
        });
    });
}

function renderAllDomains() {
    chrome.storage.local.get(null, (res) => {
        list.innerHTML = "";

        const domains = Object.keys(res).filter((k) => k !== "blockMode" && Array.isArray(res[k]));
        if (domains.length === 0) {
            const li = document.createElement("li");
            li.textContent = "No blocked elements saved yet.";
            list.appendChild(li);
            return;
        }

        domains.sort().forEach((domain) => {
            const header = document.createElement("div");
            header.className = "domain";
            header.textContent = domain;
            list.appendChild(header);

            (res[domain] || []).forEach((sel, i) => {
                list.appendChild(createItem(domain, sel, i, renderAllDomains));
            });
        });
    });
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0] && tabs[0].url;
    let domain = null;
    try {
        domain = url ? new URL(url).hostname : null;
    } catch {
        domain = null;
    }

    const restricted = !url || /^(chrome|edge|about|moz-extension|chrome-extension):/.test(url);
    if (restricted || !domain) {
        renderAllDomains();
    } else {
        renderDomain(domain);
    }
});
