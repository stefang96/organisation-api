import { News } from "../../entities/news.model";
import { getManager, getRepository } from "typeorm";

export class NewsRepository {
  static async createNews(news: News) {
    return await getManager().getRepository(News).save(news);
  }
  static async getNewsById(newsId: number) {
    return await getManager()
      .getRepository(News)
      .createQueryBuilder("news")
      .innerJoinAndSelect("news.member", "member")
      .innerJoinAndSelect("member.organisation", "organisation")
      .where("news.id = :id", { id: newsId })
      .getOne();
  }

  static async getNews(query: any, startIndex, limit) {
    return await query.skip(startIndex).take(limit).getMany();
  }

  static async getAllNews(query: any) {
    return await query.getMany();
  }
}
