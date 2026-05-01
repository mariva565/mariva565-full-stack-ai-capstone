import { normalizeEmail, isValidEmail } from "../email-validation";

describe("normalizeEmail", () => {
  it("lowercases the input", () => {
    expect(normalizeEmail("FOO@Bar.com")).toBe("foo@bar.com");
  });

  it("trims whitespace", () => {
    expect(normalizeEmail("  a@b.c  ")).toBe("a@b.c");
  });

  it("returns empty string for undefined", () => {
    expect(normalizeEmail(undefined)).toBe("");
  });

  it("returns empty string for number input", () => {
    expect(normalizeEmail(42)).toBe("");
  });

  it("returns empty string for null", () => {
    expect(normalizeEmail(null)).toBe("");
  });
});

describe("isValidEmail", () => {
  it("accepts a valid short email", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
  });

  it("accepts email with dots and plus tag", () => {
    expect(isValidEmail("user.name+tag@example.com")).toBe(true);
  });

  it("rejects empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });

  it("rejects string with no @ sign", () => {
    expect(isValidEmail("no-at-sign")).toBe(false);
  });

  it("rejects string with two @ signs", () => {
    expect(isValidEmail("two@@signs.com")).toBe(false);
  });

  it("rejects email missing TLD dot", () => {
    expect(isValidEmail("missing@dot")).toBe(false);
  });

  it("rejects email with space", () => {
    expect(isValidEmail("with space@example.com")).toBe(false);
  });
});
