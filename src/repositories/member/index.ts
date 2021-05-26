import { getManager, getRepository, getConnection } from "typeorm";
import { Member, MembersRole } from "../../entities/member.model";
import { Organisation } from "../../entities/organisation.model";

export class MemberRepository {
  static async saveMember(member: any) {
    return await getManager().getRepository(Member).save(member);
  }

  static async getMemberByEmail(email) {
    return await getManager()
      .getRepository(Member)
      .findOne(
        { email: email },
        {
          relations: ["organisation"],
        }
      );
  }

  static async getVerifyMember(query) {
    const { email, verifytoken } = query;

    return await getManager()
      .getRepository(Member)
      .findOne({ email: email, verifytoken: verifytoken });
  }

  static async getAllContactPersons() {
    return await getManager()
      .getRepository(Organisation)
      .createQueryBuilder("organisation")
      .leftJoinAndSelect("organisation.contactPerson", "contactPerson")
      .select([
        "organisation.id",
        "contactPerson.id",
        "contactPerson.firstName",
        "contactPerson.lastName",
      ])
      .getMany();
  }

  static async getSetPasswordMember(params: any) {
    const { email, setpasswordtoken } = params;

    return await getManager()
      .getRepository(Member)
      .findOne({ email: email, setpasswordtoken: setpasswordtoken });
  }

  static async getMemberById(memberId: number) {
    return await getManager()
      .getRepository(Member)
      .findOne(
        { id: memberId },
        {
          relations: [
            "organisation",
            "news",
            "news.member",
            "news.member.organisation",
          ],
        }
      );
  }

  static async getAllMembers(query: any) {
    return await query.getMany();
  }

  static async getMembers(query: any, startIndex, limit) {
    return await query
      .skip(startIndex)
      .take(limit)
      .orderBy("member.id", "ASC")
      .getMany();
  }

  static async deleteMember(memberId: number) {
    return await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Member)
      .where("id = :id", { id: memberId })
      .execute();
  }

  static async getOrganisationAdmins(organisationId) {
    return await getManager()
      .getRepository(Member)
      .createQueryBuilder("member")
      .innerJoinAndSelect("member.organisation", "organisation")
      .where("organisation.id = :id", { id: organisationId })
      .andWhere("member.role = :role", { role: MembersRole.ADMIN })
      .getMany();
  }
}
