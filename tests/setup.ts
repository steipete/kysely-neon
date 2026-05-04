import * as crypto from "isomorphic-webcrypto";

Object.defineProperty(globalThis, "crypto", {
  configurable: true,
  value: crypto,
});
