import { hashPassword, verifyPassword } from "../auth";

describe("hashPassword", () => {
  it("returns a non-empty string", () => {
    expect(hashPassword("hello")).toBeTruthy();
  });

  it("returns a different string from the input (hashed)", () => {
    expect(hashPassword("hello")).not.toBe("hello");
  });

  it("produces a different hash on each call (different salt)", () => {
    expect(hashPassword("hello")).not.toBe(hashPassword("hello"));
  });
});

describe("verifyPassword", () => {
  it("returns true for correct password and its hash", () => {
    const hash = hashPassword("hello");
    expect(verifyPassword("hello", hash)).toBe(true);
  });

  it("returns false for wrong password", () => {
    const hash = hashPassword("hello");
    expect(verifyPassword("wrong", hash)).toBe(false);
  });

  it("returns false for empty inputs without crashing", () => {
    expect(verifyPassword("", "")).toBe(false);
  });

  it("returns false for invalid hash without throwing", () => {
    expect(() => verifyPassword("hello", "not-a-real-hash")).not.toThrow();
    expect(verifyPassword("hello", "not-a-real-hash")).toBe(false);
  });
});
