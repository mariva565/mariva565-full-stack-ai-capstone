import { slugify } from "../slugify";

describe("slugify", () => {
  it("lowercases and hyphenates words", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("trims leading and trailing whitespace", () => {
    expect(slugify("  spaced  ")).toBe("spaced");
  });

  it("strips punctuation", () => {
    expect(slugify("Capstone, Issues!")).toBe("capstone-issues");
  });

  it("collapses multiple spaces into one hyphen", () => {
    expect(slugify("a    b")).toBe("a-b");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("a---b")).toBe("a-b");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("preserves underscores", () => {
    expect(slugify("hello_world")).toBe("hello_world");
  });
});
