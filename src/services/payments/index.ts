import { getManager, getRepository, getConnection } from "typeorm";
import { Payments } from "../../entities/payments.model";
import { PaymentsRepository } from "../../repositories/payments";
import moment = require("moment");
import jwt from "jsonwebtoken";
import { MemberService } from "../members";
import { MemberRepository } from "../../repositories/member";
import { MemberHelper } from "../../utilities/member";

export class PaymentsService {
  static async createPayments(body: any) {
    const loggedUser = jwt.decode(body.token);
    const payments = new Payments();
    payments.price = body.price;
    payments.createdAt = moment().unix();
    payments.fromDate = moment().unix();
    payments.toDate = moment().add(1, "years").unix();
    payments.member = loggedUser.id;
    payments.active = true;

    await PaymentsRepository.savePayments(payments);

    const member = await MemberService.getMemberById(loggedUser.id);
    member.active = true;
    const updatedMember = await MemberRepository.saveMember(member);

    return await MemberHelper.setLoginResponse(updatedMember);
  }
  static async getPaymentsById(paymentsId: number) {
    return await PaymentsRepository.getPaymentsById(paymentsId);
  }

  static async getLatestPayment(token) {
    const loggedUser = jwt.decode(token);
    const payments = (await PaymentsRepository.getLatestPayment(
      loggedUser.id
    )) as any;

    return payments[0];
  }

  static async getLatestPaymentByMemberId(memberId) {
    const payments = (await PaymentsRepository.getLatestPayment(
      memberId
    )) as any;

    if (payments) return payments[0];

    return null;
  }

  static async getPayments(body: any, paginationValue = false) {
    const { pagination, filters, memberId } = body;

    let query = getManager()
      .getRepository(Payments)
      .createQueryBuilder("payments")
      .leftJoinAndSelect("payments.member", "member")
      .leftJoinAndSelect("member.organisation", "organisation");

    if (body.token) {
      const loggedUser = jwt.decode(body.token);
      if (loggedUser.role !== "super_admin") {
        query = query.andWhere("organisation.id = :organisationId", {
          organisationId: loggedUser.organisation.id,
        });
      }
    }

    if (body.memberId) {
      query = query.andWhere("member.id = :memberId", {
        memberId: memberId,
      });
    }
    if (body.filters) {
      const { memberId } = filters;

      if (memberId) {
        query = query.andWhere("member.id = :id", {
          id: memberId,
        });
      }
    }

    if (paginationValue) {
      // Pagination
      const page = parseInt(pagination.page, 10) || 1;
      const limit = 9;
      const startIndex = (page - 1) * limit;

      //with pagination
      return await PaymentsRepository.getPayments(query, startIndex, limit);
    }
    //without pagination
    return await PaymentsRepository.getAllPayments(query);
  }

  static async deletePayments(paymentsId: number) {
    return await PaymentsRepository.deletePayments(paymentsId);
  }
}
