"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const t0_1 = require("t0");
const _assert = __importStar(require("assert"));
const _1 = require(".");
const { equal, ok } = _assert;
t0_1.test("encode", () => {
    equal(_1.encode(Buffer.from("f")), "Zg");
    equal(_1.encode(Buffer.from("fi")), "Zmk");
    equal(_1.encode(Buffer.from("fis")), "Zmlz");
    equal(_1.encode(Buffer.from("fish")), "ZmlzaA");
    equal(_1.encode(Buffer.from([248])), "-A");
    equal(_1.encode(Buffer.from([252])), "_A");
});
t0_1.test("decode", () => {
    equal(_1.decode("Zg").toString(), "f");
    equal(_1.decode("Zmk").toString(), "fi");
    equal(_1.decode("Zmlz").toString(), "fis");
    equal(_1.decode("ZmlzaA").toString(), "fish");
    ok(Buffer.from([248]).equals(_1.decode("-A")));
    ok(Buffer.from([252]).equals(_1.decode("_A")));
});
t0_1.run();
//# sourceMappingURL=test.js.map