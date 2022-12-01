export function encode(buffer: Buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError("`buffer` must be a buffer.")
  }
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+/, "")
}

export function decode(input: string) {
  if (!(typeof input === "string")) {
    throw new TypeError("`input` must be a string.")
  }
  const n = input.length % 4
  const padded = input + "=".repeat(n > 0 ? 4 - n : n)
  const base64String = padded.replace(/\-/g, "+").replace(/\_/g, "/")
  return Buffer.from(base64String, "base64")
}
