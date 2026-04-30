import fs from "fs";

const INPUT_URL =
  "https://raw.githubusercontent.com/cybersterr/jeeyo/refs/heads/main/stream.json";

const OUTPUT_FILE = "output.json";

const DASH_PROXY = "https://pasteking.u0k.workers.dev/k22jk.html/";

async function main() {
  console.log("📥 Fetching remote stream.json...");

  const res = await fetch(INPUT_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch JSON: ${res.status}`);
  }

  const raw = await res.json();
  const channels = raw.channels || {};

  const result = {
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

      // ✅ Extract cookie
      const cookieMatch = url.match(/__hdnea__=([^&]+)/);
      const cookie = cookieMatch
        ? `__hdnea__=${cookieMatch[1]}`
        : "";

      // ✅ Clean MPD URL (NO params inside)
      const cleanMpd = url.split("?")[0];

      // ✅ Build FINAL LINK (correct format)
      let finalLink =
        `${DASH_PROXY}?url=${encodeURIComponent(cleanMpd)}` +
        `&keyId=${kid || ""}` +
        `&key=${key || ""}` +
        `&name=${encodeURIComponent(displayName)}`;

      if (cookie) {
        finalLink += `&cookie=${encodeURIComponent(cookie)}`;
      }

      return {
        name: displayName,
        id,
        logo: tvg_logo,
        group: group_title,
        link: finalLink
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
