import { describe, expect, it } from "vitest";
import { initialTheme, nextTheme, toggleLabel } from "../src/theme";

describe("tmavý režim", () => {
  it("výchozí vzhled odpovídá systému", () => {
    expect(initialTheme(true)).toBe("dark");
    expect(initialTheme(false)).toBe("light");
  });

  it("přepínač střídá světlý a tmavý režim", () => {
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("light");
    expect(nextTheme(nextTheme("light"))).toBe("light");
  });

  it("tlačítko nabízí opačný režim", () => {
    expect(toggleLabel("light")).toContain("Tmavý");
    expect(toggleLabel("dark")).toContain("Světlý");
  });
});
