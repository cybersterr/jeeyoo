import fs from "fs";

const INPUT_URL =
  "https://raw.githubusercontent.com/cybersterr/jeeyo/refs/heads/main/stream.json";

const OUTPUT_FILE = "output.json";

const DASH_PROXY = "https://pasteking.u0k.workers.dev/k22jk.html/?url=";
const EPG_URL = "https://avkb.short.gy/jioepg.xml.gz";

async function main() {
  console.log("📥 Fetching remote stream.json...");

  const res = await fetch(INPUT_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch JSON: ${res.status}`);
  }

  const raw = await res.json();

  const channels = raw.channels || {};

  const result = {
    playlist_info: {
      extm3u: true,
      url_tvg: EPG_URL
    },
    channels: Object.entries(channels).map(([id, data]) => {
      const {
        kid,
        key,
        url,
        group_title,
        tvg_logo,
        channel_name
      } = data;

      let rawName;

      if (url.includes("/bpk-tv/")) {
        rawName = url.split("/bpk-tv/")[1].split("/")[0];
        rawName = rawName.replace("_BTS", "");
      } else {
        rawName = channel_name
          ? channel_name.replace(/\s+/g, "_")
          : id.replace(/\s+/g, "_");
      }

      const displayName =
        channel_name || rawName.replace(/_/g, " ");

      const cookieMatch = url.match(/__hdnea__=([^&]+)/);
      const cookie = cookieMatch
        ? `__hdnea__=${cookieMatch[1]}`
        : "";

      const finalUrl =
        `${url.split("?")[0]}` +
        `?name=${encodeURIComponent(rawName)}` +
        `&keyId=${kid || ""}` +
        `&key=${key || ""}` +
        (cookie ? `&cookie=${encodeURIComponent(cookie)}` : "");

      return {
        name: displayName,
        id,
        logo: tvg_logo,
        group: group_title,
        link: DASH_PROXY + encodeURIComponent(finalUrl)
      };
    })
  };

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(result, null, 4)
  );

  console.log("✅ output.json generated successfully");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
