import { Member, MembersRole } from "../../entities/member.model";
import { MemberRepository } from "../../repositories/member";
import { Nodemailer } from "../../utilities/email/nodemailer";
import { MemberHelper } from "../../utilities/member";
import { MemberValidation } from "../../utilities/member/validation";
import { getManager, Brackets } from "typeorm";
import moment = require("moment");
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";

const saltRounds = 10;
export class MemberService {
  static async createContactPerson(contactPerson: any, organisationId: number) {
    // User validaton
    const isValid = await MemberValidation.validationContactPerson(
      contactPerson
    );

    if (!isValid) {
      throw new Error("Validation error.");
    }

    // check if user exist
    const ifExist = await MemberHelper.memberEmailExist(contactPerson.email);

    if (ifExist) {
      throw new Error("Exist user with that email!");
    }

    const newMember = new Member();

    newMember.email = contactPerson.email;
    newMember.verifytoken = await bcrypt.hash(
      contactPerson.email + MembersRole.ADMIN,
      saltRounds
    );
    newMember.firstName = contactPerson.firstName;
    newMember.lastName = contactPerson.lastName;
    newMember.phone = contactPerson.phone;
    newMember.role = MembersRole.ADMIN;
    newMember.active = false;
    newMember.organisation = organisationId as any;
    console.log(moment().unix());
    newMember.createdAt = moment().unix();

    await Nodemailer.inviteContactPerson(newMember);
    return await MemberRepository.saveContactPerson(newMember);
  }

  static async sendEmailToContactPerson(body: any, memberId) {
    const member = await MemberRepository.getMemberById(memberId);
    await Nodemailer.sendEmailToContactPerson(body, member.email);
  }

  static async getMemberById(memberId: number) {
    return await MemberRepository.getMemberById(memberId);
  }

  static async getAllMembers(body: any, paginationValue = false) {
    console.log(body);
    const { pagination, filters } = body;

    let query = getManager()
      .getRepository(Member)
      .createQueryBuilder("member")
      .leftJoinAndSelect("member.organisation", "organisation")
      .where("member.active = :active", { active: true });

    if (body.token) {
      const loggedUser = jwt.decode(body.token);
      query = query.andWhere("organisation.id = :organisationId", {
        organisationId: loggedUser.organisation.id,
      });
      console.log(loggedUser);
    }

    if (paginationValue) {
      // Pagination
      const page = parseInt(pagination.page, 10) || 1;
      const limit = 10;
      const startIndex = (page - 1) * limit;

      //with pagination
      return await MemberRepository.getMembers(query, startIndex, limit);
    }
    //without pagination
    return await MemberRepository.getAllMembers(query);
  }
}
