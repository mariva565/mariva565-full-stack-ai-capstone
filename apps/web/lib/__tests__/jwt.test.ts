import { signToken, verifyToken, JwtPayload } from "../jwt";

const PAYLOAD: JwtPayload = { sub: 1, email: "a@b.co", role: "user" };

describe("signToken", () => {
  it("returns a string with two dots (JWT format)", async () => {
    const token = await signToken(PAYLOAD);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);
  });
});

describe("verifyToken", () => {
  it("returns the original payload for a valid token", async () => {
    const token = await signToken(PAYLOAD);
    const result = await verifyToken(token);
    expect(result).not.toBeNull();
    expect(result!.sub).toBe(PAYLOAD.sub);
    expect(result!.email).toBe(PAYLOAD.email);
    expect(result!.role).toBe(PAYLOAD.role);
  });

  it("returns null for a non-JWT string", async () => {
    expect(await verifyToken("not-a-jwt")).toBeNull();
  });

  it("returns null for an empty string", async () => {
    expect(await verifyToken("")).toBeNull();
  });

  it("returns null for a token with a tampered signature", async () => {
    const token = await signToken(PAYLOAD);
    const tampered = token.slice(0, -1) + (token.endsWith("x") ? "y" : "x");
    expect(await verifyToken(tampered)).toBeNull();
  });
});

describe("getJwtSecret validation (module-level guards)", () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  it("throws when JWT_SECRET is missing", () => {
    delete process.env.JWT_SECRET;
    expect(() => require("../jwt")).toThrow("JWT_SECRET is required");
  });

  it("throws when JWT_SECRET is shorter than 32 chars", () => {
    process.env.JWT_SECRET = "tooshort";
    expect(() => require("../jwt")).toThrow("at least 32");
  });

  it("throws when JWT_SECRET contains a placeholder substring", () => {
    process.env.JWT_SECRET = "this-has-changeme-padded-to-32-chars-or-more";
    expect(() => require("../jwt")).toThrow("placeholder");
  });
});
