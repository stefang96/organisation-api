import joi from "joi";

export class OrganisationValidation {
  static async validateOragnisation(body: any) {
    const schema = joi.object().keys({
      name: joi.string().trim().required().error(new Error("Name is required")),
      price: joi.string().required().error(new Error("Price is required.")),
      address: joi
        .string()
        .min(2)
        .required()
        .error(new Error("Address field is required.")),
      numberOfEmployees: joi.allow(null),
    });

    const result = schema.validate(body);

    if (result.error) {
      throw new Error(result.error.message);
    } else if (result.errors) {
      throw new Error(result.errors[0].message);
    } else {
      return result.value;
    }
  }
}
