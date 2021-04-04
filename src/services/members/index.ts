import { errorMonitor } from "stream";
import { Member, MembersRole } from "../../entities/member.model";
import { MemberRepository } from "../../repositories/member";
import { Nodemailer } from "../../utilities/email/nodemailer";
import { MemberHelper } from "../../utilities/member";
import { MemberValidation } from "../../utilities/member/validation";
const moment = require("moment");
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
    newMember.contactPerson = true;
    newMember.active = false;
    newMember.organisation = organisationId as any;
    newMember.createdAt = moment().unix();

    await Nodemailer.inviteContactPerson(newMember);
    return await MemberRepository.saveContactPerson(newMember);
  }
}
