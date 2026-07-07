import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ProfileNotFoundError, ProfileService } from "./src/profileService.js";

describe("ProfileService", () => {
  it("upserts a validated profile with stable created_at", () => {
    const service = new ProfileService(undefined, () => new Date("2026-01-01T00:00:00.000Z"));

    const created = service.upsert({
      id: "user-1",
      full_name: "Asha Sharma",
      email: "asha@example.com",
      preferred_language: "hi",
      state: "Maharashtra",
      district: "Pune",
      age: 62,
      occupation: "retired",
      income_range: "1_to_3_lakh",
      family_details: { dependents: 1 }
    });

    const updated = service.upsert({
      id: created.id,
      full_name: "Asha S.",
      email: created.email,
      preferred_language: created.preferred_language,
      state: created.state,
      district: created.district,
      age: created.age,
      occupation: created.occupation,
      income_range: created.income_range,
      family_details: created.family_details
    });

    expect(updated.full_name).toBe("Asha S.");
    expect(updated.created_at).toBe("2026-01-01T00:00:00.000Z");
  });

  it("rejects malformed profile data through Zod", () => {
    const service = new ProfileService();

    expect(() =>
      service.upsert({
        id: "user-2",
        full_name: "Bad Email",
        email: "not-an-email",
        preferred_language: "en",
        state: "Gujarat",
        district: "Ahmedabad",
        age: 34,
        occupation: "worker",
        income_range: "unknown"
      })
    ).toThrow(z.ZodError);
  });

  it("throws a typed error for missing profiles", () => {
    const service = new ProfileService();
    expect(() => service.getForUser("missing")).toThrow(ProfileNotFoundError);
  });
});
