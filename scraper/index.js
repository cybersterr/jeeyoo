import fs from "fs";

const INPUT_URL =
  "https://m3u-86e.pages.dev/jtv-mb.json";

const OUTPUT_FILE = "output.json";

const DASH_PROXY = "https://dash.vodep39240327.workers.dev/?url=";

async function main() {
  console.log("📥 Fetching remote stream.json...");

  const res = await fetch(INPUT_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch JSON: ${res.status}`);
  }

  const raw = await res.json();

  const result = raw.map((data) => {
    const {
      id,
      name,
      group,
      logo,
      mpd_url,
      license_url,
      headers
    } = data;

    const url = mpd_url;

    // Name for URL param (same logic as before)
    let rawName = "";
    if (url.includes("/bpk-tv/")) {
      rawName = url.split("/bpk-tv/")[1].split("/")[0];
      rawName = rawName.replace("_BTS", "");
    } else {
      rawName = name.replace(/ /g, "_");
    }

    const displayName = name || rawName.replace(/_/g, " ");

    // Extract cookie
    const cookieMatch = url.match(/__hdnea__=([^&]+)/);
    const cookie = cookieMatch
      ? `__hdnea__=${cookieMatch[1]}`
      : headers?.cookie || "";

    const finalUrl =
      `${url.split("?")[0]}` +
      `?name=${encodeURIComponent(rawName)}` +
      `&keyId=${id}` +
      `&key=${encodeURIComponent(license_url)}` +
      (cookie ? `&cookie=${cookie}` : "");

    return {
      name: displayName,
      id,
      logo,
      group,
      link: DASH_PROXY + finalUrl
    };
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 4));
  console.log("✅ output.json generated successfully");
}

main().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
