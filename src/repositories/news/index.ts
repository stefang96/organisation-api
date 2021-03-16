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
      .where("news.id = :id", { id: newsId })
      .getOne();
  }

  static async getNews() {
    return await getManager()
      .getRepository(News)
      .createQueryBuilder("news")
      .innerJoinAndSelect("news.member", "member")
      .getMany();
  }
}
