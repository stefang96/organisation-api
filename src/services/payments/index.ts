import { getManager, getRepository, getConnection } from "typeorm";
import { Payments } from "../../entities/payments.model";
import { PaymentsRepository } from "../../repositories/payments";
import moment = require("moment");
import jwt from "jsonwebtoken";

export class PaymentsService {
  static async createPayments(body: any) {
    const loggedUser = jwt.decode(body.token);
    const payments = new Payments();
    payments.price = body.price;
    payments.createdAt = moment().unix();
    payments.fromDate = moment().unix();
    payments.toDate = moment().add(1, "years").unix();
    payments.member = loggedUser.id;

    return await PaymentsRepository.savePayments(payments);
  }
  static async getPaymentsById(paymentsId: number) {
    return await PaymentsRepository.getPaymentsById(paymentsId);
  }

  static async getPayments(body: any, paginationValue = false) {
    const { pagination, filters, memberId } = body;

    let query = getManager()
      .getRepository(Payments)
      .createQueryBuilder("payments")
      .leftJoinAndSelect("payments.member", "member")
      .leftJoinAndSelect("member.organisation", "organisation")
      .where("payments.active = :active", { active: true });

    if (body.token) {
    }

    if (body.memberId) {
      query = query.andWhere("member.id = :memberId", {
        memberId: memberId,
      });
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
