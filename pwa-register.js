/*
 * Registration is deliberately not added to index.html yet.
 * It will only be enabled after the separate test version is reviewed.
 */
if ("serviceWorker" in navigator && window.location.protocol === "https:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js", { scope: "./" })
      .catch((error) => {
        console.error("Dark Case Audio offline shell could not be registered.", error);
      });
  });
}
