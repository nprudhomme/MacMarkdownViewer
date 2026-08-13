import { afterEach, beforeEach, describe, it, expect } from "vitest";
import { confirmDialog } from "./confirm-dialog";

function mountConfirmMarkup(): void {
  document.body.innerHTML = `
    <div id="confirm-backdrop" class="prefs-backdrop" style="display:none">
      <div role="alertdialog" aria-modal="true">
        <span id="confirm-title"></span>
        <p id="confirm-message"></p>
        <button id="confirm-cancel"></button>
        <button id="confirm-ok"></button>
      </div>
    </div>
  `;
}

const DEFAULTS = {
  title: "Confirm",
  message: "Are you sure?",
  okLabel: "OK",
  cancelLabel: "Cancel",
};

describe("confirmDialog", () => {
  beforeEach(() => {
    mountConfirmMarkup();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("populates title, message and button labels from options", () => {
    void confirmDialog({
      title: "Delete theme",
      message: "Delete this theme?",
      okLabel: "Yes",
      cancelLabel: "No",
    });
    expect(document.getElementById("confirm-title")!.textContent).toBe(
      "Delete theme"
    );
    expect(document.getElementById("confirm-message")!.textContent).toBe(
      "Delete this theme?"
    );
    expect(
      (document.getElementById("confirm-ok") as HTMLButtonElement).textContent
    ).toBe("Yes");
    expect(
      (document.getElementById("confirm-cancel") as HTMLButtonElement).textContent
    ).toBe("No");
  });

  it("shows the backdrop when opened", () => {
    void confirmDialog(DEFAULTS);
    expect(
      (document.getElementById("confirm-backdrop") as HTMLDivElement).style
        .display
    ).toBe("flex");
  });

  it("resolves to true when OK is clicked", async () => {
    const p = confirmDialog(DEFAULTS);
    document.getElementById("confirm-ok")!.click();
    await expect(p).resolves.toBe(true);
  });

  it("resolves to false when Cancel is clicked", async () => {
    const p = confirmDialog(DEFAULTS);
    document.getElementById("confirm-cancel")!.click();
    await expect(p).resolves.toBe(false);
  });

  it("resolves to false when Escape is pressed", async () => {
    const p = confirmDialog(DEFAULTS);
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    );
    await expect(p).resolves.toBe(false);
  });

  it("resolves to false when the user clicks on the backdrop", async () => {
    const p = confirmDialog(DEFAULTS);
    const backdrop = document.getElementById(
      "confirm-backdrop"
    ) as HTMLDivElement;
    backdrop.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true })
    );
    await expect(p).resolves.toBe(false);
  });

  it("does not resolve when the user clicks inside the panel", async () => {
    const p = confirmDialog(DEFAULTS);
    let settled = false;
    p.then(() => {
      settled = true;
    });
    document.getElementById("confirm-message")!.click();
    await new Promise((r) => setTimeout(r, 10));
    expect(settled).toBe(false);
    // Clean up so the test doesn't leak listeners.
    document.getElementById("confirm-cancel")!.click();
    await p;
  });

  it("applies the destructive class to OK when requested", async () => {
    const p = confirmDialog({ ...DEFAULTS, destructive: true });
    expect(
      document.getElementById("confirm-ok")!.classList.contains("destructive")
    ).toBe(true);
    document.getElementById("confirm-cancel")!.click();
    await p;
  });

  it("clears the destructive class when not requested", async () => {
    const p = confirmDialog({ ...DEFAULTS, destructive: false });
    expect(
      document.getElementById("confirm-ok")!.classList.contains("destructive")
    ).toBe(false);
    document.getElementById("confirm-cancel")!.click();
    await p;
  });

  it("opening a second dialog auto-cancels the first (resolves false)", async () => {
    const p1 = confirmDialog(DEFAULTS);
    const p2 = confirmDialog({ ...DEFAULTS, title: "Second" });
    document.getElementById("confirm-ok")!.click();
    await expect(p1).resolves.toBe(false);
    await expect(p2).resolves.toBe(true);
  });

  // Regression: the reveal used to run inside requestAnimationFrame. WebKit
  // suspends frames while the window is occluded, so the frame never ran and
  // the backdrop stayed display:flex at opacity 0 — an invisible layer over
  // the whole window that swallowed every click and scroll, leaving the app
  // unusable with no way for the user to dismiss it.
  it("opens and closes correctly when no animation frame ever runs", async () => {
    const originalRaf = window.requestAnimationFrame;
    // Frames are requested but never delivered, as on an occluded window.
    window.requestAnimationFrame = (() =>
      0) as unknown as typeof window.requestAnimationFrame;

    try {
      const p = confirmDialog(DEFAULTS);
      const backdrop = document.getElementById(
        "confirm-backdrop"
      ) as HTMLDivElement;

      // Revealed without waiting for a frame: displayed *and* opaque.
      expect(backdrop.style.display).toBe("flex");
      expect(backdrop.classList.contains("visible")).toBe(true);

      document.getElementById("confirm-cancel")!.click();
      await p;

      await new Promise((r) => setTimeout(r, 250));
      expect(backdrop.classList.contains("visible")).toBe(false);
      expect(backdrop.style.display).toBe("none");
    } finally {
      window.requestAnimationFrame = originalRaf;
    }
  });

  // Regression for the state actually observed in the field: both backdrops
  // left at display:flex without `visible`. WebKit suspends timers as well as
  // frames on an occluded window, so the deferred hide never ran. The dialog
  // must at least end up non-interactive — the CSS (`:not(.visible)` →
  // pointer-events/visibility) is what guarantees the window stays usable,
  // and it hinges on `visible` being absent once the dialog is closed.
  it("leaves a closed dialog non-visible even when timers never fire", async () => {
    const originalTimeout = window.setTimeout;
    window.setTimeout = (() =>
      0) as unknown as typeof window.setTimeout;

    try {
      const p = confirmDialog(DEFAULTS);
      const backdrop = document.getElementById(
        "confirm-backdrop"
      ) as HTMLDivElement;
      expect(backdrop.classList.contains("visible")).toBe(true);

      document.getElementById("confirm-cancel")!.click();
      await p;

      // `display` still says flex (its reset was deferred and never ran), so
      // the CSS hook must be the thing that neutralises the layer.
      expect(backdrop.classList.contains("visible")).toBe(false);
    } finally {
      window.setTimeout = originalTimeout;
    }
  });

  it("keeps the backdrop shown when a newer dialog took it over", async () => {
    const p1 = confirmDialog(DEFAULTS);
    const p2 = confirmDialog({ ...DEFAULTS, title: "Second" });
    const backdrop = document.getElementById(
      "confirm-backdrop"
    ) as HTMLDivElement;

    await expect(p1).resolves.toBe(false);
    // Past the first dialog's hide delay: it must not hide the second's.
    await new Promise((r) => setTimeout(r, 250));
    expect(backdrop.style.display).toBe("flex");

    document.getElementById("confirm-ok")!.click();
    await p2;
    await new Promise((r) => setTimeout(r, 250));
    expect(backdrop.style.display).toBe("none");
  });

  it("falls back to window.confirm when the markup is missing", async () => {
    document.body.innerHTML = "";
    const originalConfirm = window.confirm;
    window.confirm = () => true;
    try {
      await expect(confirmDialog(DEFAULTS)).resolves.toBe(true);
    } finally {
      window.confirm = originalConfirm;
    }
  });
});
