import { Response } from "express";
import moment from "moment";
import { MemberRepository } from "../../repositories/member";
import { MemberService } from "../members";
import { OrganisationService } from "../organisation";
import * as bcrypt from "bcrypt";
import { MemberHelper } from "../../utilities/member";
import { MemberValidation } from "../../utilities/member/validation";
import { OrganisationRepository } from "../../repositories/organisation";
import { verifyToken } from "../../utilities/auth/token";
import { Nodemailer } from "../../utilities/email/nodemailer";
import crypto from "crypto";
import { PaymentsService } from "../payments";

const saltRounds = 10;
export class AuthServices {
  static async signup(body: any) {
    const organisation = {
      name: body.name,
      numberOfEmployees: body.numberOfEmployees ? body.numberOfEmployees : null,
      price: body.price,
      address: body.address,
    };
    const createdOrganisation =
      await OrganisationService.createPublicOrganisation(organisation);

    const contactPerson = {
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
    };

    // If contact-person creation or the follow-up save fails, roll back the
    // organisation we just created so signup does not leave an orphan behind.
    // (A DB transaction would be cleaner but requires threading an
    // EntityManager through the service/repository layers.)
    try {
      const createdContactPerson = await MemberService.createContactPerson(
        contactPerson,
        createdOrganisation.id
      );

      createdOrganisation.contactPerson = createdContactPerson;

      await OrganisationRepository.saveOrganisation(createdOrganisation);
    } catch (error) {
      await OrganisationRepository.deleteOrganisation(createdOrganisation.id);
      throw error;
    }

    return "Successfully signup! <br/> Please check your email.";
  }

  static async changePassword(body: any, token) {
    const { password, rePassword } = body;
    const loggedUser = verifyToken(token);

    if (password.toString().trim() !== rePassword.toString().trim()) {
      throw new Error("Password does not match");
    }
    const member = await MemberRepository.getMemberById(loggedUser.id);

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password.toString().trim(), salt);
    member.password = hashPassword;
    return await MemberRepository.saveMember(member);
  }
  static async login(body: any) {
    const { email, password } = body;

    const member = await MemberRepository.getMemberByEmail(email);

    if (!member) {
      return;
    }

    const match = await bcrypt.compare(password, member.password);

    if (!match) {
      return;
    }

    const payment = await PaymentsService.getLatestPaymentByMemberId(member.id);

    let updatedMember = member;
    if (payment && Number(payment.toDate) < Number(moment().unix())) {
      member.active = false;

      updatedMember = await MemberRepository.saveMember(member);
    }

    return await MemberHelper.setLoginResponse(updatedMember);
  }

  static async verifyMember(query: any, res: Response) {
    const member = await MemberRepository.getVerifyMember(query);

    if (!member) {
      throw new Error("Invalid or expired verification link.");
    }
    member.createdAt = moment().unix();
    member.verified = true;

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

    if (!member) {
      throw new Error("Member does not exist!");
    }

    if (!MemberValidation.checkPassword(data)) {
      throw new Error("Password and confirm password does not match!");
    }

    member.setpasswordtoken = null;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(
      data.password.toString().trim(),
      salt
    );
    member.password = hashPassword;

    return await MemberRepository.saveMember(member);
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
