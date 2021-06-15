import { Organisation } from "../../entities/organisation.model";
import { OrganisationRepository } from "../../repositories/organisation";
import { OrganisationValidation } from "../../utilities/organisation/validation";
import { getManager, Brackets } from "typeorm";
import jwt from "jsonwebtoken";
import moment = require("moment");
import { MemberRepository } from "../../repositories/member";
import { MembersRole } from "../../entities/member.model";

export class OrganisationService {
  static async createPublicOrganisation(organisation: any) {
    // Organisation validaton

    const isValid = await OrganisationValidation.validateOragnisation(
      organisation
    );

    if (!isValid) {
      throw new Error("Validation error!");
    }

    const newOrganisation = new Organisation();
    newOrganisation.name = organisation.name;
    newOrganisation.numberOfEmployees = organisation.numberOfEmployees;
    newOrganisation.price = organisation.price;
    newOrganisation.address = organisation.address;
    newOrganisation.active = true;
    newOrganisation.createdAt = moment().unix();

    return await OrganisationRepository.saveOrganisation(newOrganisation);
  }

  static async getOrganisationById(organisationId: number) {
    return await OrganisationRepository.getOrganisationById(organisationId);
  }

  static async getAllOrganisation(body: any, paginationValue = false) {
    const { pagination, filters } = body;

    let query = getManager()
      .getRepository(Organisation)
      .createQueryBuilder("organisation")
      .leftJoinAndSelect("organisation.members", "member")
      .leftJoinAndSelect("organisation.contactPerson", "contactPerson");

    if (body.token) {
      const loggedUser = jwt.decode(body.token);
      if (loggedUser.role === MembersRole.ADMIN) {
        query = query.andWhere("organisation.id = :organisationId", {
          organisationId: loggedUser.organisation.id,
        });
      }
    }

    if (body.filters) {
      const { memberId, search } = filters;

      if (search) {
        query = query.andWhere("LOWER(organisation.name)  like LOWER(:name)", {
          name: "%" + search + "%",
        });
      }

      if (memberId) {
        query = query.andWhere("contactPerson.id = :memberId", {
          memberId: memberId,
        });
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
    const organisation = await this.getOrganisationById(organisationdId);
    const { name, numberOfEmployees, type, address, contactPerson, price } =
      body;

    organisation.name = name;
    organisation.numberOfEmployees = numberOfEmployees;
    organisation.type = type;
    organisation.price = price;
    organisation.address = address;
    organisation.contactPerson = contactPerson as any;

    await OrganisationRepository.saveOrganisation(organisation);

    return await this.getOrganisationById(organisationdId);
  }

  static async deleteOrganisation(organisationdId: number) {
    return await OrganisationRepository.deleteOrganisation(organisationdId);
  }

  static async createOrganisation(body: any) {
    const isValid = await OrganisationValidation.validateOragnisation(body);

    if (!isValid) {
      throw new Error("Validation error!");
    }

    const newOrganisation = new Organisation();
    newOrganisation.name = body.name;
    newOrganisation.numberOfEmployees = body.numberOfEmployees;

    newOrganisation.price = body.price;
    newOrganisation.address = body.address;
    newOrganisation.active = true;
    newOrganisation.createdAt = moment().unix();

    return await OrganisationRepository.saveOrganisation(newOrganisation);
  }

  static async getOrganisationAdmins(organisationId) {
    return await MemberRepository.getOrganisationAdmins(organisationId);
  }
}
