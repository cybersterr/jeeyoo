import fs from "fs";

const INPUT_URL =
  "https://raw.githubusercontent.com/cybersterr/jeeyo/refs/heads/main/stream.json";

const OUTPUT_FILE = "output.json";

const DASH_PROXY = "https://dashproxy.droozy.workers.dev/";

async function main() {
  console.log("📥 Fetching remote stream.json...");

  const res = await fetch(INPUT_URL);

  if (!res.ok) {
    throw new Error(`Failed to fetch JSON: ${res.status}`);
  }

  const channels = await res.json();

  if (!Array.isArray(channels)) {
    throw new Error("Input JSON is not an array");
  }

  const result = {
    channels: channels.map((data) => {
      const {
        name,
        id,
        category,
        keyId,
        key,
        logo,
        url,
        cookie
      } = data;

      const cleanMpd = url
        ? url.split("?")[0]
        : "";

      let finalLink =
        `${DASH_PROXY}?url=${cleanMpd}` +
        `&keyId=${keyId || ""}` +
        `&key=${key || ""}` +
        `&name=${encodeURIComponent(name || "")}`;

      if (cookie) {
        finalLink += `&cookie=${cookie}`;
      }

      return {
        name: name || "",
        id: id || "",
        logo: logo || "",
        group: category || "",
        link: finalLink
      };
    })
  };

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(result, null, 4)
  );

  console.log(
    `✅ output.json generated successfully. ${channels.length} channels processed.`
  );
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
