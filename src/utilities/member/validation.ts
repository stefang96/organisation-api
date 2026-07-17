import joi, { ValidationError } from "joi";

export class MemberValidation {
  static async validationContactPerson(body) {
    const schema = joi.object().keys({
      email: joi
        .string()
        .trim()
        .email()
        .required()
        .error(new Error("Email must be a valid.")),
      firstName: joi
        .string()
        .min(2)
        .required()
        .error(new Error("First name is required.")),
      lastName: joi
        .string()
        .min(2)
        .required()
        .error(new Error("Last name is required.")),
      phone: joi.allow(null),
    });

    const result = schema.validate(body);

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.value;
  }

  static checkPassword(data: any) {
    const { password, rePassword } = data;

    return (
      password != null &&
      rePassword != null &&
      password.toString().trim() === rePassword.toString().trim()
    );
  }
}
