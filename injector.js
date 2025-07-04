function injectEditor() {
  const target = document.querySelector("#secondary-inner");
  if (!target) return;

  // Remove existing container if it exists
  const existing = document.getElementById("ytnotes-container");
  if (existing) {
    console.log("Removing old ytnotes container");
    existing.remove();
  }

  // Create new container and re-append to target
  const container = document.createElement("div");
  container.id = "ytnotes-container";
  container.innerHTML = `<div id="ytnotes-container-root"></div>`;
  target.prepend(container);

  // Inject CSS once
  if (!document.getElementById("askify-style")) {
    const style = document.createElement("link");
    style.id = "askify-style";
    style.rel = "stylesheet";
    style.href = chrome.runtime.getURL("yt_notes/dist/assets/main.css");
    document.head.appendChild(style);
  }

  // Dynamically import the React app again
  console.log("Reloading Askify React App...");
  console.log("Loading from:", chrome.runtime.getURL("yt_notes/dist/assets/index.js"));
  import(chrome.runtime.getURL("yt_notes/dist/assets/index.js"))
  .then(() => {
    console.log("🔁 ytnotes React App loaded, calling mount...");
    if (window.askifyMountApp) {
      window.askifyMountApp();
    } else {
      console.error("❌ mountApp is not available on window");
    }
  })
  .catch(err => {
    console.error("❌ Failed to reload React App:", err);
  });


}


// ==============================
// Call this from your popup.js or background.js
// Example: when "Notes" button is clicked
// ==============================

if (document.getElementById("ytnotes-container")) {
  console.log("Editor already exists. Skipping injection.");
} else if (window.location.hostname.includes("youtube.com")) {
  console.log("Inside YouTube. Checking for screenshot button...");

  const screenshotBtn = document.querySelector(".ytp-screenshot");
  if (screenshotBtn) {
    console.info("Screenshot button found. Toggling Askify state...");

    chrome.storage.local.get("YTNOTES_DEFAULT_CHANGE_EDITOR", (result) => {
      const current = result?.YTNOTES_DEFAULT_CHANGE_EDITOR || false;
      chrome.storage.local.set({
        YTNOTES_DEFAULT_CHANGE_EDITOR: !current
      }, () => {
        console.log("YTNOTES_DEFAULT_CHANGE_EDITOR set to", !current);
      });
    });

  } else {
    console.log("No screenshot button found. Injecting YTNOTES...");
    injectEditor();
  }

} else {
  console.log("Not on YouTube. Injecting YTNOTES anyway...");
  injectEditor();
}
