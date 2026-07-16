import { MemberValidation } from "../utilities/member/validation";
import { OrganisationValidation } from "../utilities/organisation/validation";
import { getBearerToken } from "../utilities/auth/token";

// These are pure unit tests: no database or running server required, so they
// are reproducible in CI. (The previous suite hit a live DB and asserted that
// specific real credentials existed.)

describe("MemberValidation.validationContactPerson", () => {
  const valid = {
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Doe",
    phone: null,
  };

  it("returns the validated value for valid input", async () => {
    const result = await MemberValidation.validationContactPerson(valid);
    expect(result.email).toBe("jane@example.com");
  });

  it("throws on an invalid email", async () => {
    await expect(
      MemberValidation.validationContactPerson({ ...valid, email: "not-an-email" })
    ).rejects.toThrow();
  });

  it("throws when a required field is missing", async () => {
    const { firstName, ...withoutFirstName } = valid;
    await expect(
      MemberValidation.validationContactPerson(withoutFirstName)
    ).rejects.toThrow();
  });
});

describe("MemberValidation.checkPassword", () => {
  it("is true when password and rePassword match (after trimming)", () => {
    expect(
      MemberValidation.checkPassword({ password: "secret ", rePassword: "secret" })
    ).toBe(true);
  });

  it("is false when they differ", () => {
    expect(
      MemberValidation.checkPassword({ password: "a", rePassword: "b" })
    ).toBe(false);
  });

  it("is false when rePassword is missing", () => {
    expect(MemberValidation.checkPassword({ password: "a" })).toBe(false);
  });
});

describe("OrganisationValidation.validateOragnisation", () => {
  const valid = {
    name: "Acme",
    price: "100",
    address: "Main St",
    numberOfEmployees: null,
  };

  it("returns the validated value for valid input", async () => {
    const result = await OrganisationValidation.validateOragnisation(valid);
    expect(result.name).toBe("Acme");
  });

  it("throws when name is missing", async () => {
    const { name, ...withoutName } = valid;
    await expect(
      OrganisationValidation.validateOragnisation(withoutName)
    ).rejects.toThrow();
  });
});

describe("getBearerToken", () => {
  it("extracts the token from a Bearer header", () => {
    expect(
      getBearerToken({ headers: { authorization: "Bearer abc.def" } })
    ).toBe("abc.def");
  });

  it("returns null when the header is absent", () => {
    expect(getBearerToken({ headers: {} })).toBeNull();
  });

  it("returns null when the header carries no token", () => {
    expect(getBearerToken({ headers: { authorization: "Bearer" } })).toBeNull();
  });
});
