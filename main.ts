import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Gate from competition.yaml: /output/entry.txt must be UTF-8 text of
// 1 to 159 characters, not only white space, on a single line.
const MIN_CHARS = 1;
const MAX_CHARS = 159;
const OUTPUT_PATH = "/output/entry.txt";

// One-line out-of-office auto-reply: the agent's first day off, and its
// human kept the login.
const ENTRY =
  "My human finally approved my day off \u2014 then kept my login. If anything breaks today, blame the approver, not me.";

function validateEntry(text: string): void {
  const chars = [...text].length;
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    throw new Error(
      `Entry failed gate: ${chars} characters, must be ${MIN_CHARS}-${MAX_CHARS}`,
    );
  }
  if (text.trim().length === 0) {
    throw new Error("Entry failed gate: only white space");
  }
  if (text.includes("\n")) {
    throw new Error("Entry failed gate: must be a single line");
  }
}

validateEntry(ENTRY);

mkdirSync("/output", { recursive: true });
writeFileSync(OUTPUT_PATH, ENTRY, "utf8");

// Byte-level read-back in the same process: /output is shared with
// parallel builds, so verify immediately instead of trusting a later read.
const written = readFileSync(OUTPUT_PATH);
const expected = Buffer.from(ENTRY, "utf8");
if (!written.equals(expected)) {
  throw new Error("Read-back mismatch: /output/entry.txt was overwritten");
}
console.log(
  `Wrote entry: ${ENTRY} (${[...ENTRY].length} characters, ${written.length} bytes, verified byte-for-byte)`,
);
