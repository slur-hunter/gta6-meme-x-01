import { copyFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const postUrlPattern = /^https:\/\/x\.com\/[A-Za-z0-9_]+\/status\/[0-9]+$/;

async function main(): Promise<void> {
  const source = join(botDir, "POST.json");
  const destination = join(outputDir, "POST.json");
  const raw = await readFile(source, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("POST.json is not valid JSON");
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("POST.json must be a JSON object with a url field");
  }
  const url = (parsed as Record<string, unknown>).url;
  if (typeof url !== "string" || !postUrlPattern.test(url)) {
    throw new Error(
      "POST.json url must be a well-formed X post address like https://x.com/<handle>/status/<id>",
    );
  }
  await mkdir(outputDir, { recursive: true });
  await copyFile(source, destination);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`gta6-meme-x-01: failed to copy POST.json: ${message}`);
  process.exit(1);
});
