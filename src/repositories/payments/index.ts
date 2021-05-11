import { getManager, getRepository, getConnection } from "typeorm";
import { Payments } from "../../entities/payments.model";

export class PaymentsRepository {
  static async savePayments(payments: Payments) {
    return await getManager().getRepository(Payments).save(payments);
  }
  static async getPaymentsById(paymentsId: number) {
    return await getManager()
      .getRepository(Payments)
      .createQueryBuilder("payments")
      .innerJoinAndSelect("payments.member", "member")
      .innerJoinAndSelect("member.organisation", "organisation")
      .where("payments.id = :id", { id: paymentsId })
      .getOne();
  }

  static async getPayments(query: any, startIndex, limit) {
    return await query
      .skip(startIndex)
      .take(limit)
      .orderBy("payments.createdAt", "DESC")
      .getMany();
  }

  static async getLatestPayment(memberId) {
    return await getManager()
      .getRepository(Payments)
      .createQueryBuilder("payments")
      .innerJoinAndSelect("payments.member", "member")
      .innerJoinAndSelect("member.organisation", "organisation")
      .where("member.id = :id", { id: memberId })
      .orderBy("payments.createdAt", "DESC")
      .getMany();
  }

  static async getAllPayments(query: any) {
    return await query.getMany();
  }

  static async updatePayments(body: Payments, paymentsId: number) {
    /*  const { title, description, shortDescription } = body;
    return await getConnection()
      .createQueryBuilder()
      .update(Payments)
      .set({
        title: title,
        shortDescription: shortDescription,
        description: description,
      })
      .where("id = :id", { id: paymentsId })
      .execute(); */
  }

  static async deletePayments(paymentsId: number) {
    return await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Payments)
      .where("id = :id", { id: paymentsId })
      .execute();
  }
}
