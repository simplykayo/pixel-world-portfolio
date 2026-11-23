import { randomBytes, pbkdf2Sync } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const rl = createInterface({ input: stdin, output: stdout });
const password = await rl.question("Admin password (use a unique, long password): ");
rl.close();
if (password.length < 14) {
  console.error("Use at least 14 characters.");
  process.exit(1);
}
const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, 310000, 32, "sha256");
console.log("\nSet this as the ADMIN_PASSWORD_HASH secret in Cloudflare:\n");
console.log(["pbkdf2",310000,salt.toString("base64"),hash.toString("base64")].join("$"));
