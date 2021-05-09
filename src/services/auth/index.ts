import { Response } from "express";
import moment from "moment";
import { MemberRepository } from "../../repositories/member";
import { MemberService } from "../members";
import { OrganisationService } from "../organisation";
import * as bcrypt from "bcrypt";
import { MemberHelper } from "../../utilities/member";
import { MemberValidation } from "../../utilities/member/validation";
import { OrganisationRepository } from "../../repositories/organisation";
import { object } from "joi";
import { Nodemailer } from "../../utilities/email/nodemailer";
import crypto from "crypto";

const saltRounds = 10;
export class AuthServices {
  static async signup(body: any) {
    const organisation = {
      name: body.name,
      numberOfEmployees: body.numberOfEmployees,
      type: body.type,
      address: body.address,
    };
    const createdOrganisation = await OrganisationService.createPublicOrganisation(
      organisation
    );

    const contactPerson = {
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
    };
    const createdContactPerson = await MemberService.createContactPerson(
      contactPerson,
      createdOrganisation.id
    );

    createdOrganisation.contactPerson = createdContactPerson;

    await OrganisationRepository.saveOrganisation(createdOrganisation);

    return "Successfully signup! <br/> Please check your email.";
  }

  static async login(body: any) {
    const { email, password } = body;
    console.log(body);
    const member = await MemberRepository.getMemberByEmail(email);

    console.log(member);
    if (!member) {
      return;
    }

    const match = await bcrypt.compare(password, member.password);

    if (!match) {
      return;
    }

    return await MemberHelper.setLoginResponse(member);
  }

  static async verifyMember(query: any, res: Response) {
    const member = await MemberRepository.getVerifyMember(query);

    if (!member) {
      return;
    }
    member.createdAt = moment().unix();
    member.verified = true;
    member.active = true;
    member.verifytoken = null;
    member.setpasswordtoken = await bcrypt.hash(
      member.role + member.email,
      saltRounds
    );

    await MemberRepository.saveMember(member);

    const frontendUrl = process.env.FRONTEND_URL;

    return res.redirect(
      `${frontendUrl}/set-password?email=` +
        encodeURIComponent(member.email) +
        "&setpasswordtoken=" +
        encodeURIComponent(member.setpasswordtoken)
    );
  }

  static async setPassword(body: any) {
    const { params, data } = body;

    const member = await MemberRepository.getSetPasswordMember(params);
    const checkPassword = await MemberValidation.checkPassword(data);

    if (!checkPassword) {
      throw new Error("Password and confirm password does not match!");
    }

    if (!member) {
      throw new Error("Member does not exist!");
    }

    member.setpasswordtoken = null;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(
      data.password.toString().trim(),
      salt
    );
    member.password = hashPassword;

    await MemberRepository.saveMember(member);
  }

  static async resetPassword(body: any) {
    const { email } = body;

    const member = await MemberRepository.getMemberByEmail(email);

    const salt = await bcrypt.genSalt(10);
    const plainText = crypto.randomBytes(6).toString("hex");
    const hashPassword = await bcrypt.hash(plainText, salt);

    member.password = hashPassword;

    await Nodemailer.resetPassword(plainText, email);

    await MemberRepository.saveMember(member);

    return;
  }
}
