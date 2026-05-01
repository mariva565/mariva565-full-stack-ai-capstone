import {
  isStrongPassword,
  getPasswordStrength,
  PASSWORD_POLICY_MESSAGE,
} from "../password-validation";

describe("isStrongPassword", () => {
  it("accepts a password with all required categories", () => {
    expect(isStrongPassword("Aa1!aaaa")).toBe(true);
  });

  it("rejects a password that is too short", () => {
    expect(isStrongPassword("short1!")).toBe(false);
  });

  it("rejects a password with no uppercase letter", () => {
    expect(isStrongPassword("alllower1!")).toBe(false);
  });

  it("rejects a password with no lowercase letter", () => {
    expect(isStrongPassword("ALLUPPER1!")).toBe(false);
  });

  it("rejects a password with no digit", () => {
    expect(isStrongPassword("NoDigits!!")).toBe(false);
  });

  it("rejects a password with no special character", () => {
    expect(isStrongPassword("NoSpecial1")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isStrongPassword("")).toBe(false);
  });
});

describe("getPasswordStrength", () => {
  it("returns weak for single lowercase char", () => {
    // score: has lowercase(1) = 1 → weak
    expect(getPasswordStrength("a")).toBe("weak");
  });

  it("returns weak for 8 lowercase chars (score 2)", () => {
    // score: length>=8(1) + lowercase(1) = 2 → weak
    expect(getPasswordStrength("aaaaaaaa")).toBe("weak");
  });

  it("returns fair for 8 chars with upper and lower (score 3)", () => {
    // score: length>=8(1) + upper(1) + lower(1) = 3 → fair
    expect(getPasswordStrength("Aaaaaaaa")).toBe("fair");
  });

  it("returns fair for 8 chars with upper, lower, digit (score 4)", () => {
    // score: length>=8(1) + upper(1) + lower(1) + digit(1) = 4 → fair
    expect(getPasswordStrength("Aa1aaaaa")).toBe("fair");
  });

  it("returns strong for 8 chars with all 4 categories (score 5)", () => {
    // score: length>=8(1) + upper(1) + lower(1) + digit(1) + special(1) = 5 → strong
    expect(getPasswordStrength("Aa1!aaaa")).toBe("strong");
  });

  it("returns strong for 12+ chars with all 4 categories (score 6)", () => {
    // score: length>=8(1) + length>=12(1) + upper(1) + lower(1) + digit(1) + special(1) = 6 → strong
    expect(getPasswordStrength("Aa1!aaaaaaaa")).toBe("strong");
  });
});

describe("PASSWORD_POLICY_MESSAGE", () => {
  it("exists and contains the word uppercase", () => {
    expect(PASSWORD_POLICY_MESSAGE).toBeDefined();
    expect(PASSWORD_POLICY_MESSAGE.toLowerCase()).toContain("uppercase");
  });
});
