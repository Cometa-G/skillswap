const crypto = require("crypto");

function getKey() {
  const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || "skillswap-local-secret";
  return crypto.createHash("sha256").update(secret).digest();
}

function encrypt(text) {
  if (!text) return "";

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(String(text), "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64")
  ].join(".");
}

function decrypt(encoded) {
  if (!encoded) return "";

  const [ivText, tagText, encryptedText] = String(encoded).split(".");
  if (!ivText || !tagText || !encryptedText) {
    return Buffer.from(encoded, "base64").toString("utf8");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(ivText, "base64")
  );
  decipher.setAuthTag(Buffer.from(tagText, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "base64")),
    decipher.final()
  ]).toString("utf8");
}

module.exports = { encrypt, decrypt };
