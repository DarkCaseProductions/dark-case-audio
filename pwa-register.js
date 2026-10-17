/*
 * Registers the service worker on the isolated PWA preview branch.
 * This file is not linked from the live main-branch homepage.
 */
if ("serviceWorker" in navigator && window.location.protocol === "https:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js", { scope: "./" })
      .catch((error) => {
        console.error("Dark Case Audio offline shell could not be registered.", error);
      });
  });
}