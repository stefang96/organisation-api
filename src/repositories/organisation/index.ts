import { getManager, getRepository, getConnection } from "typeorm";
import { Member } from "../../entities/member.model";
import { Organisation } from "../../entities/organisation.model";

export class OrganisationRepository {
  static async saveOrganisation(organisation: Organisation) {
    return await getManager().getRepository(Organisation).save(organisation);
  }

  static async getOrganisationById(organisationId: number) {
    return await getManager()
      .getRepository(Organisation)
      .createQueryBuilder("organisation")
      .innerJoinAndSelect("organisation.members", "members")
      .innerJoinAndSelect("organisation.contactPerson", "contactPerson")
      .where("organisation.id = :id", { id: organisationId })
      .getOne();
  }

  static async getAllOrganisations(query: any) {
    return await query.getMany();
  }

  static async getOrganisations(query: any, startIndex, limit) {
    return await query
      .skip(startIndex)
      .take(limit)
      .orderBy("organisation.createdAt", "DESC")
      .getMany();
  }

  static async deleteOrganisation(organisationId: number) {
    return await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Organisation)
      .where("id = :id", { id: organisationId })
      .execute();
  }
}
