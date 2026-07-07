import {
  Profile,
  ProfileSchema,
  UpsertProfileInput,
  UpsertProfileInputSchema
} from "../../../packages/contracts/src/index.js";

export class ProfileNotFoundError extends Error {
  constructor(userId: string) {
    super(`Profile not found for user ${userId}`);
    this.name = "ProfileNotFoundError";
  }
}

export class InMemoryProfileRepository {
  private readonly profiles = new Map<string, Profile>();

  upsert(profile: Profile): Profile {
    const parsed = ProfileSchema.parse(profile);
    this.profiles.set(parsed.id, parsed);
    return parsed;
  }

  get(userId: string): Profile | undefined {
    return this.profiles.get(userId);
  }
}

export class ProfileService {
  constructor(
    private readonly repo = new InMemoryProfileRepository(),
    private readonly now = () => new Date()
  ) {}

  upsert(input: UpsertProfileInput): Profile {
    const parsed = UpsertProfileInputSchema.parse(input);
    const existing = this.repo.get(parsed.id);

    return this.repo.upsert({
      ...parsed,
      family_details: parsed.family_details ?? existing?.family_details ?? {},
      created_at: existing?.created_at ?? this.now().toISOString()
    });
  }

  getForUser(userId: string): Profile {
    const profile = this.repo.get(userId);
    if (!profile) {
      throw new ProfileNotFoundError(userId);
    }
    return profile;
  }
}
