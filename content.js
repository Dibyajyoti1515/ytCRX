document.getElementById("askify-close-btn").addEventListener("click", () => {
    const container = document.getElementById("askify-container");
    console.log("close button clicked");
    if (container) {
      container.remove();
    }
  });