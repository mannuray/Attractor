/**
 * @jest-environment node
 */
import { execFileSync } from "child_process";
import path from "path";

// Vercel loads proxy.js and api/og.js with Node's CommonJS loader (the project has no
// "type": "module"), so they must be self-contained CommonJS bundles. These checks run in a
// real Node process, exactly as Vercel loads them, not through Jest's module system.
const root = path.join(__dirname, "../..");
const node = (script: string) =>
  execFileSync(process.execPath, ["-e", script], { cwd: root, encoding: "utf8", timeout: 60000 }).trim();

describe("server bundles", () => {
  it("are up to date with src/server", () => {
    expect(() => execFileSync(process.execPath, ["scripts/build-server.mjs", "--check"], { cwd: root, stdio: "pipe" })).not.toThrow();
  });

  it("proxy.js loads as CommonJS and passes plain visits through", () => {
    const out = node(`
      const m = require("./proxy.js");
      const proxy = m.default || m;
      Promise.resolve(proxy(new Request("https://chaos-iterator.vercel.app/")))
        .then(r => console.log(typeof proxy, r.headers.get("x-middleware-next")));
    `);
    expect(out).toBe("function 1");
  });

  it("api/og.js loads as CommonJS and serves a card", () => {
    const out = node(`
      const { GET } = require("./api/og.js");
      GET(new Request("https://x/api/og?type=nope"))
        .then(r => console.log(typeof GET, r.status));
    `);
    expect(out).toBe("function 404");
  });
});
