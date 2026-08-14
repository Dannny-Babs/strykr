import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../auth/credentials";

describe("credential security", () => {
  it("stores a salted password hash rather than the original password", async () => {
    const hash = await hashPassword("Pilot-ready-password-42");
    expect(hash).not.toContain("Pilot-ready-password-42");
    expect(hash.split(":")).toHaveLength(3);
  });

  it("accepts the correct password and rejects the wrong one", async () => {
    const hash = await hashPassword("Pilot-ready-password-42");
    await expect(verifyPassword("Pilot-ready-password-42", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });
});
