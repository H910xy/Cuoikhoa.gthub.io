(() => {
    const MAX_FILE_SIZE = 25 * 1024 * 1024;
    const MAX_FILES = 10;
    const MAX_STORAGE = MAX_FILE_SIZE * MAX_FILES;
    const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png"]);

    const elements = {
        dropzone: document.getElementById("dropzone"),
        fileInput: document.getElementById("file-input"),
        fileList: document.getElementById("file-list"),
        feedback: document.getElementById("dz-feedback"),
        footerStatus: document.getElementById("footer-status"),
        storageRing: document.getElementById("storage-ring"),
        storageRingFill: document.getElementById("storage-ring-fill"),
        storageRingPct: document.getElementById("storage-ring-pct"),
        clearButton: document.getElementById("btn-clear"),
        uploadButton: document.getElementById("btn-upload"),
        totalProgress: document.getElementById("total-progress"),
        totalProgressBar: document.getElementById("total-progress-bar"),
        infoButton: document.getElementById("info-btn"),
        infoPanel: document.getElementById("info-panel"),
        settingsButton: document.getElementById("settings-btn"),
        settingsPanel: document.getElementById("settings-panel"),
        autoUpload: document.getElementById("toggle-auto"),
        showThumbnails: document.getElementById("toggle-thumbs"),
        notifications: document.getElementById("toggle-notify")
    };

    const files = [];
    let isUploading = false;
    let nextFileId = 0;
    let feedbackTimeout;

    function showFeedback(message, type = "") {
        clearTimeout(feedbackTimeout);
        elements.feedback.textContent = message;
        elements.feedback.className = `dz-feedback${type ? ` is-${type}` : ""}`;
        if (message && type !== "error") {
            feedbackTimeout = setTimeout(() => {
                elements.feedback.textContent = "";
                elements.feedback.className = "dz-feedback";
            }, 5000);
        }
    }

    function formatSize(bytes) {
        if (bytes < 1024 * 1024) {
            return `${Math.max(1, Math.round(bytes / 1024))} KB`;
        }
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function getStatusLabel(item) {
        if (item.status === "uploading") {
            return `Uploading ${item.progress}%`;
        }
        if (item.status === "complete") {
            return "Demo complete";
        }
        return "Ready to upload";
    }

    function renderFiles() {
        elements.fileList.replaceChildren();

        files.forEach((item) => {
            const row = document.createElement("div");
            row.className = "dz-file";
            row.setAttribute("role", "listitem");

            const preview = document.createElement("div");
            preview.className = "dz-file__preview";
            if (item.previewUrl && elements.showThumbnails.getAttribute("aria-checked") === "true") {
                const image = document.createElement("img");
                image.src = item.previewUrl;
                image.alt = "";
                preview.append(image);
            } else {
                preview.textContent = item.file.type === "image/png" ? "PNG" : "JPG";
            }

            const details = document.createElement("div");
            details.className = "dz-file__details";

            const name = document.createElement("div");
            name.className = "dz-file__name";
            name.textContent = item.file.name;
            name.title = item.file.name;

            const meta = document.createElement("div");
            meta.className = "dz-file__meta";
            const size = document.createElement("span");
            size.textContent = formatSize(item.file.size);
            const status = document.createElement("span");
            status.textContent = getStatusLabel(item);
            meta.append(size, status);

            const progressTrack = document.createElement("div");
            progressTrack.className = "dz-file__bar";
            progressTrack.setAttribute("aria-hidden", "true");
            const progressBar = document.createElement("div");
            progressBar.className = "dz-file__bar-fill";
            progressBar.style.width = `${item.progress}%`;
            progressTrack.append(progressBar);
            details.append(name, meta, progressTrack);

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "dz-file__remove";
            removeButton.setAttribute("aria-label", `Remove ${item.file.name}`);
            removeButton.textContent = "×";
            removeButton.disabled = isUploading;
            removeButton.addEventListener("click", () => removeFile(item.id));

            row.append(preview, details, removeButton);
            elements.fileList.append(row);
        });

        updateSummary();
    }

    function updateSummary() {
        const totalBytes = files.reduce((sum, item) => sum + item.file.size, 0);
        const usage = Math.min(100, Math.round((totalBytes / MAX_STORAGE) * 100));
        const progress = files.length
            ? Math.round(files.reduce((sum, item) => sum + item.progress, 0) / files.length)
            : 0;

        elements.storageRingFill.style.strokeDashoffset = `${62.83 - (62.83 * usage) / 100}`;
        elements.storageRingPct.textContent = `${usage}%`;
        elements.storageRing.setAttribute("aria-label", `Storage usage: ${usage} percent`);
        elements.footerStatus.textContent = files.length
            ? `${files.length} of ${MAX_FILES} files · ${formatSize(totalBytes)}`
            : "No files selected";
        elements.clearButton.disabled = files.length === 0 || isUploading;
        elements.uploadButton.disabled = files.length === 0 || isUploading;
        elements.uploadButton.setAttribute("aria-busy", String(isUploading));
        elements.totalProgress.setAttribute("aria-hidden", String(!isUploading));
        elements.totalProgress.setAttribute("aria-valuenow", String(progress));
        elements.totalProgressBar.style.width = `${progress}%`;
    }

    function removeFile(id) {
        const index = files.findIndex((item) => item.id === id);
        if (index < 0 || isUploading) {
            return;
        }
        const [removed] = files.splice(index, 1);
        if (removed.previewUrl) {
            URL.revokeObjectURL(removed.previewUrl);
        }
        renderFiles();
    }

    function validateFile(file) {
        if (!ACCEPTED_TYPES.has(file.type)) {
            return "Only JPEG and PNG images are accepted.";
        }
        if (file.size > MAX_FILE_SIZE) {
            return `${file.name} exceeds the 25 MB limit.`;
        }
        if (file.size === 0) {
            return `${file.name} is empty.`;
        }
        return "";
    }

    function addFiles(fileList, shouldAutoUpload = false) {
        if (isUploading) {
            showFeedback("Wait until the current demo upload finishes.", "error");
            return;
        }

        const incoming = Array.from(fileList);
        const errors = [];
        let addedCount = 0;

        incoming.forEach((file) => {
            const validationError = validateFile(file);
            if (validationError) {
                errors.push(validationError);
                return;
            }

            const duplicate = files.some((item) =>
                item.file.name === file.name &&
                item.file.size === file.size &&
                item.file.lastModified === file.lastModified
            );
            if (duplicate) {
                errors.push(`${file.name} is already selected.`);
                return;
            }

            if (files.length >= MAX_FILES) {
                errors.push(`You can select up to ${MAX_FILES} files.`);
                return;
            }

            files.push({
                id: nextFileId++,
                file,
                progress: 0,
                status: "ready",
                previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : ""
            });
            addedCount += 1;
        });

        renderFiles();
        elements.fileInput.value = "";

        if (errors.length) {
            showFeedback(errors.join(" "), "error");
        } else if (addedCount) {
            showFeedback(`${addedCount} file${addedCount === 1 ? "" : "s"} added.`, "success");
        }

        if (shouldAutoUpload && addedCount) {
            uploadFiles();
        }
    }

    function uploadFiles() {
        const pendingFiles = files.filter((item) => item.status === "ready");
        if (!pendingFiles.length || isUploading) {
            return;
        }

        isUploading = true;
        showFeedback("Demo only: no files are sent to a server.", "success");
        renderFiles();

        const interval = setInterval(() => {
            pendingFiles.forEach((item) => {
                item.progress = Math.min(100, item.progress + 10 + Math.floor(Math.random() * 16));
                if (item.progress === 100) {
                    item.status = "complete";
                } else {
                    item.status = "uploading";
                }
            });
            renderFiles();

            if (pendingFiles.every((item) => item.progress >= 100)) {
                clearInterval(interval);
                isUploading = false;
                renderFiles();
                if (elements.notifications.getAttribute("aria-checked") === "true") {
                    showFeedback("Demo complete. Connect a server endpoint to upload files.", "success");
                }
            }
        }, 220);
    }

    function setPanel(button, panel, open) {
        button.setAttribute("aria-expanded", String(open));
        panel.setAttribute("aria-hidden", String(!open));
        panel.inert = !open;
    }

    function closePanels() {
        setPanel(elements.infoButton, elements.infoPanel, false);
        setPanel(elements.settingsButton, elements.settingsPanel, false);
    }

    function togglePanel(button, panel, otherButton, otherPanel) {
        const willOpen = button.getAttribute("aria-expanded") !== "true";
        setPanel(otherButton, otherPanel, false);
        setPanel(button, panel, willOpen);
    }

    elements.fileInput.addEventListener("change", (event) => {
        addFiles(event.currentTarget.files);
    });

    elements.dropzone.addEventListener("keydown", (event) => {
        if (event.target === elements.dropzone && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            elements.fileInput.click();
        }
    });

    ["dragenter", "dragover"].forEach((eventName) => {
        elements.dropzone.addEventListener(eventName, (event) => {
            event.preventDefault();
            elements.dropzone.classList.add("is-dragover");
        });
    });

    ["dragleave", "drop"].forEach((eventName) => {
        elements.dropzone.addEventListener(eventName, (event) => {
            event.preventDefault();
            elements.dropzone.classList.remove("is-dragover");
        });
    });

    elements.dropzone.addEventListener("drop", (event) => {
        addFiles(event.dataTransfer.files, elements.autoUpload.getAttribute("aria-checked") === "true");
    });

    elements.clearButton.addEventListener("click", () => {
        if (isUploading) {
            return;
        }
        files.forEach((item) => {
            if (item.previewUrl) {
                URL.revokeObjectURL(item.previewUrl);
            }
        });
        files.length = 0;
        renderFiles();
        showFeedback("Selection cleared.", "success");
    });

    elements.uploadButton.addEventListener("click", uploadFiles);

    elements.infoButton.addEventListener("click", () => {
        togglePanel(elements.infoButton, elements.infoPanel, elements.settingsButton, elements.settingsPanel);
    });

    elements.settingsButton.addEventListener("click", () => {
        togglePanel(elements.settingsButton, elements.settingsPanel, elements.infoButton, elements.infoPanel);
    });

    [elements.autoUpload, elements.showThumbnails, elements.notifications].forEach((toggle) => {
        toggle.addEventListener("click", () => {
            const isChecked = toggle.getAttribute("aria-checked") === "true";
            toggle.setAttribute("aria-checked", String(!isChecked));
            if (toggle === elements.showThumbnails) {
                renderFiles();
            }
        });
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".dz-header__actions")) {
            closePanels();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closePanels();
        }
    });

    renderFiles();
})();
