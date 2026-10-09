import { SYSTEM_CATALOG, getSystemMeta } from "../attractors/catalog";
import { registry } from "../attractors/registry";
import "../attractors";

describe("system catalog", () => {
  it("has every registered system, identical except Controls", () => {
    const registered = registry.getAll();
    expect(SYSTEM_CATALOG.map(s => s.id).sort()).toEqual(registered.map(m => m.id).sort());
    for (const m of registered) {
      const { Controls, ...meta } = m;
      expect(getSystemMeta(m.id)).toEqual(meta);
    }
  });

  it("does not depend on React", () => {
    jest.isolateModules(() => {
      jest.doMock("react", () => { throw new Error("catalog must not import react"); });
      expect(() => require("../attractors/catalog")).not.toThrow();
    });
  });
});
