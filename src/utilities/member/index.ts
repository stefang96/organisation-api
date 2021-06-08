import { MemberRepository } from "../../repositories/member";
const jwt = require("jsonwebtoken");

export class MemberHelper {
  static async memberEmailExist(email) {
    const members = await MemberRepository.getMemberByEmail(email);

    if (members) {
      return true;
    }

    return false;
  }

  static async generateJwtToken(data) {
    return jwt.sign(data, process.env.TOKEN_SECRET_KEY, {
      expiresIn: process.env.TOKEN_EXP_TIME,
    });
  }

  static async setLoginResponse(member: any) {
    const tokenData = {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone,
      role: member.role,
      active: member.active,
      organisation: {
        id: member.organisation.id,
        name: member.organisation.name,
        price: member.organisation.price,
      },
    };

    const token = await this.generateJwtToken(tokenData);

    return { token: token };
  }
}
