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
    newMember.createdAt = moment().unix();

    await Nodemailer.inviteUser(newMember);
    return await MemberRepository.saveMember(newMember);
  }

  static async sendEmailToContactPerson(body: any, memberId) {
    const member = await MemberRepository.getMemberById(memberId);
    await Nodemailer.sendEmailToContactPerson(body, member.email);
  }

  static async getMemberById(memberId: number) {
    return await MemberRepository.getMemberById(memberId);
  }

  static async getAllMembers(body: any, token = null, paginationValue = false) {
    const { pagination, filters, organisationId } = body;
    console.log({ pagination, filters, token, organisationId });
    let query = getManager()
      .getRepository(Member)
      .createQueryBuilder("member")
      .leftJoinAndSelect("member.organisation", "organisation");

    if (token !== "null") {
      const loggedUser = jwt.decode(token);
      if (loggedUser.role === MembersRole.ADMIN) {
        query = query.andWhere("organisation.id = :organisationId", {
          organisationId: loggedUser.organisation.id,
        });
      }
    }

    if (organisationId) {
      query = query.andWhere("organisation.id = :organisationId", {
        organisationId: organisationId,
      });
    }

    if (body.filters) {
      const { status, search } = filters;

      if (search) {
        query = query.andWhere(
          new Brackets((qb) => {
            qb.where("LOWER(member.firstName)  like LOWER(:firstName)", {
              firstName: "%" + search + "%",
            }).orWhere("LOWER(member.lastName)  like LOWER(:lastName)", {
              lastName: "%" + search + "%",
            });
          })
        );
      }

      if (status) {
        query = query.andWhere("member.status = :status", {
          status: status,
        });
      }
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

  static async createMember(body: any) {
    console.log(body);
    const { firstName, lastName, email, phone, role } = body;
    const loggedUser = jwt.decode(body.token);

    const newMember = new Member();

    newMember.firstName = firstName;
    newMember.lastName = lastName;
    newMember.email = email;
    newMember.phone = phone ? phone : null;
    newMember.role = role;
    newMember.createdAt = moment().unix();
    newMember.organisation = loggedUser.organisation.id;
    newMember.active = false;
    newMember.verifytoken = await bcrypt.hash(email + role, saltRounds);

    await Nodemailer.inviteUser(newMember);
    return await MemberRepository.saveMember(newMember);
  }

  static async updateMember(body: any, memberId: number) {
    console.log(body);
    const { firstName, lastName, email, phone, role } = body;
    const loggedUser = jwt.decode(body.token);
    const member = await this.getMemberById(memberId);

    member.firstName = firstName;
    member.lastName = lastName;
    member.email = email;
    member.phone = phone ? phone : null;
    member.role = role && role;

    return await MemberRepository.saveMember(member);
  }

  static async deleteMember(memberId: number) {
    return await MemberRepository.deleteMember(memberId);
  }
}
