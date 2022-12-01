"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function encode(buffer) {
    if (!Buffer.isBuffer(buffer)) {
        throw new TypeError("`buffer` must be a buffer.");
    }
    return buffer
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+/, "");
}
exports.encode = encode;
function decode(input) {
    if (!(typeof input === "string")) {
        throw new TypeError("`input` must be a string.");
    }
    const n = input.length % 4;
    const padded = input + "=".repeat(n > 0 ? 4 - n : n);
    const base64String = padded.replace(/\-/g, "+").replace(/\_/g, "/");
    return Buffer.from(base64String, "base64");
}
exports.decode = decode;
//# sourceMappingURL=index.js.map