export function addCopyButtons(container: HTMLElement): void {
  for (const pre of container.querySelectorAll("pre")) {
    if (!pre.querySelector("code")) continue;
    if (pre.querySelector(".copy-btn")) continue;

    (pre as HTMLElement).style.position = "relative";
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.addEventListener("click", () => {
      const code = pre.querySelector("code");
      if (!code) return;
      navigator.clipboard.writeText(code.textContent ?? "").then(() => {
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = "Copy";
          btn.classList.remove("copied");
        }, 2000);
      });
    });
    pre.appendChild(btn);
  }
}

export function addImageLightbox(
  container: HTMLElement,
  onImageClick: (img: HTMLImageElement) => void
): void {
  for (const img of container.querySelectorAll("img")) {
    (img as HTMLElement).style.cursor = "pointer";
    img.addEventListener("click", () => onImageClick(img as HTMLImageElement));
  }
}
