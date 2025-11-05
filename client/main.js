// --- Detect if running inside a Discord Activity iframe ---
//import { DiscordSDK } from "/vendor/discord/output/index.mjs"; 
import { DiscordSDK } from " https://unpkg.com/@discord/embedded-app-sdk"; 


const params = new URLSearchParams(window.location.search);
const inDiscord =
  params.has("frame_id") ||                // official param from Discord
  (window.parent !== window && /Discord/i.test(navigator.userAgent)); // heuristic

let discordSdk = null;

// Only import & initialize the SDK when inside Discord
async function setupDiscordSdk() {
  if (inDiscord) return;
  // Import ESM build (or use your bundler)
  discordSdk = new DiscordSDK("1435462812540600520");
  await discordSdk.ready();
}



// Instantiate the Unity build
// --- Config: update these names to match your actual build ---
const buildUrl = "/Build";
const loaderUrl = `${buildUrl}/SuperDoodles.loader.js`;
const config = {
  dataUrl: `${buildUrl}/SuperDoodles.data`,
  frameworkUrl: `${buildUrl}/SuperDoodles.framework.js`,
  codeUrl: `${buildUrl}/SuperDoodles.wasm`,
  // Optional extras:
  // streamingAssetsUrl: "unity/StreamingAssets",
  companyName: "My Company",
  productName: "My Game",
  productVersion: "1.0",
  devicePixelRatio: 1, // set 1 for predictable sizing; use window.devicePixelRatio for sharper
};

// --- UI refs ---
const canvas = document.getElementById("unity-canvas");
const loading = document.getElementById("unity-loading");
const warningBanner = document.getElementById("unity-warning");

// Unity's loader defines createUnityInstance(global)
function loadUnityLoader() {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = loaderUrl;
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.body.appendChild(s);
  });
}

function showBanner(msg, type = "warning") {
  if (!warningBanner) return;
  warningBanner.textContent = msg;
  warningBanner.style.display = "block";
  if (type === "error") {
    warningBanner.style.background = "#ef4444";
    warningBanner.style.color = "#fff";
  }
}

// Initialize Unity
(async () => {
try {
  await setupDiscordSdk();
  await loadUnityLoader();
  const instance = await createUnityInstance(canvas, config, (progress) => {
    if (loading) loading.textContent = `Loading… ${Math.round(progress * 100)}%`;
  });
  window.unityInstance = instance;
  if (loading) loading.style.display = "none";
} catch (err) {
  console.error("Unity failed to load:", err);
  showBanner(String(err?.message || err), "error");
}
})();
