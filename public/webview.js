const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", () => {
  const isProtected = detectCloudflareProtection();
  ipcRenderer.sendToHost("DOMContentLoaded", isProtected, location.hostname);
});

ipcRenderer.on("querySelector.innerText", (event, id, selector) => ipcRenderer.sendToHost("response", id, document.querySelector(selector)?.innerText.replaceAll("\n", " ").trim() || ""));
ipcRenderer.on("querySelector.dataset", (event, id, selector) => ipcRenderer.sendToHost("response", id, JSON.stringify(document.querySelector(selector)?.dataset) || "{}"));
ipcRenderer.on("querySelector.toDataURL", (event, id, selector) => getBase64Image(id, selector));

function getBase64Image(id, selector) {
  const img = document.querySelector(selector);
  const timer = setTimeout(() => {
    getBase64FromImage(img.src);
  }, 3000);
  img.onload = (e) => {
    clearTimeout(timer);
    getBase64FromImage(img.src);
  };
  img.scrollIntoView({ behavior: "instant", block: "center" });

  function getBase64FromImage(url) {
    const xhr = new XMLHttpRequest();
    xhr.responseType = "arraybuffer";
    xhr.open("GET", url);
    xhr.onload = function () {
      const bytes = new Uint8Array(xhr.response);
      const binary = [].map.call(bytes, (byte) => String.fromCharCode(byte)).join("");
      const mediaType = xhr.getResponseHeader("content-type");
      const base64 = ["data:", mediaType ? mediaType + ";" : "", "base64,", btoa(binary)].join("");
      //ipcRenderer.sendToHost("response", id, base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, ""));
      ipcRenderer.sendToHost("response", id, base64);
      //ipcRenderer.sendToHost("debug", "querySelector.toDataURL onSuccess xhr");
    };
    xhr.onerror = (error) => ipcRenderer.sendToHost("reject", id, error);
    xhr.send();
  }
}

function detectCloudflareProtection() {
  if (!document.body) return false;

  const indicators = [
    "challenges.cloudflare.com",
    "cf-chl",
    "turnstile",
    "Ray ID",
    "cf-mitigated", // header, ale w JS trudniej
  ];

  const html = document.documentElement.outerHTML.toLowerCase();

  return indicators.some((ind) => html.includes(ind));
}
