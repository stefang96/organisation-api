import { Organisation } from "../../entities/organisation.model";
import { OrganisationRepository } from "../../repositories/organisation";
import { OrganisationValidation } from "../../utilities/organisation/validation";
import { getManager, Brackets } from "typeorm";
import jwt from "jsonwebtoken";

export class OrganisationService {
  static async createPublicOrganisation(organisation: any) {
    // Organisation validaton

    const isValid = await OrganisationValidation.validateOragnisaion(
      organisation
    );

    if (!isValid) {
      throw new Error("Validation error!");
    }

    const newOrganisation = new Organisation();
    newOrganisation.name = organisation.name;
    newOrganisation.numberOfEmployees = organisation.numberOfEmployees;
    newOrganisation.type = organisation.type;
    newOrganisation.address = organisation.address;
    newOrganisation.active = false;

    return await OrganisationRepository.createOrganisation(newOrganisation);
  }

  static async getOrganisationById(organisationId: number) {
    return await OrganisationRepository.getOrganisationById(organisationId);
  }

  static async getAllOrganisation(body: any, paginationValue = false) {
    console.log(body);
    const { pagination, filters } = body;

    let query = getManager()
      .getRepository(Organisation)
      .createQueryBuilder("organisation")
      .leftJoinAndSelect("organisation.members", "member")
      .where("organisation.active = :active", { active: true });

    if (body.token) {
      const loggedUser = jwt.decode(body.token);
      /*  query = query.andWhere("organisation.id = :organisationId", {
        organisationId: loggedUser.organisation.id,
      }); */
      console.log(loggedUser);
    }

    if (body.filters) {
      const { country, search } = filters;

      if (search) {
        query = query.andWhere("LOWER(organisation.name)  like LOWER(:name)", {
          name: "%" + search + "%",
        });
      }

      if (country) {
        /*
        query = query.andWhere("organisation.id = :organisationId", {
          organisationId: organisationId,
        }); */
      }
    }

    if (paginationValue) {
      // Pagination
      const page = parseInt(pagination.page, 10) || 1;
      const limit = 10;
      const startIndex = (page - 1) * limit;

      //with pagination
      return await OrganisationRepository.getOrganisations(
        query,
        startIndex,
        limit
      );
    }
    //without pagination
    return await OrganisationRepository.getAllOrganisations(query);
  }

  static async updateOrganisation(body: Organisation, organisationdId: number) {
    //
  }

  static async deleteOrganisation(organisationdId: number) {
    //
  }
}
