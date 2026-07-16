import { News } from "../../entities/news.model";
import { NewsRepository } from "../../repositories/news";
import moment = require("moment");
import { verifyToken } from "../../utilities/auth/token";
import fs from "fs";
import path from "path";
import { getManager, Brackets } from "typeorm";

export class NewsService {
  private static public = process.env.PUBLIC_FOLDER;
  private static port = process.env.SERVER_PORT;

  /**
   * Persist an uploaded file for a news item and return its stored file name.
   *
   * The client-supplied name is reduced to its base name to prevent path
   * traversal, and the target directory is created synchronously so failures
   * surface to the caller's try/catch instead of crashing the process from an
   * async callback.
   */
  private static async storeUploadedFile(
    newsId: number,
    files: any
  ): Promise<string> {
    // express-fileupload yields an array when several files share the field.
    const fileNews = Array.isArray(files.file) ? files.file[0] : files.file;
    const safeName = path.basename(fileNews.name);

    const dir = `${this.public}/news_${newsId}`;
    fs.mkdirSync(dir, { recursive: true });
    await fileNews.mv(`${dir}/${safeName}`);

    return safeName;
  }

  static async createNews(body: any, files: any) {
    const loggedUser = verifyToken(body.token);

    const { title, shortDescription, description } = body;

    const news = new News();
    news.title = title;
    news.description = description;
    news.shortDescription = shortDescription;
    news.member = loggedUser.id;
    news.createdAt = moment().unix();
    news.active = true;

    const createdNews = await NewsRepository.saveNews(news);

    if (files && files.file) {
      const fileName = await this.storeUploadedFile(createdNews.id, files);
      createdNews.fileName = fileName;
      createdNews.filePath = `http://localhost:${this.port}/static/news_${createdNews.id}/${fileName}`;
    }

    return await NewsRepository.saveNews(createdNews);
  }

  static async getNewsById(newsId: number) {
    return await NewsRepository.getNewsById(newsId);
  }

  static async getLatestNews(body) {
    let query = getManager()
      .getRepository(News)
      .createQueryBuilder("news")
      .innerJoinAndSelect("news.member", "member")
      .innerJoinAndSelect("member.organisation", "organisation");

    if (body.token) {
      const loggedUser = verifyToken(body.token);
      if (loggedUser.role !== "super_admin") {
        query = query.andWhere("organisation.id = :organisationId", {
          organisationId: loggedUser.organisation.id,
        });
      }
    }

    return await NewsRepository.getLatestNews(query);
  }

  static async getNews(body: any, paginationValue = false) {
    const { pagination, filters, memberId } = body;

    let query = getManager()
      .getRepository(News)
      .createQueryBuilder("news")
      .leftJoinAndSelect("news.member", "member")
      .leftJoinAndSelect("member.organisation", "organisation")
      .where("news.active = :active", { active: true });

    if (body.token) {
      const loggedUser = verifyToken(body.token);
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
      const { organisationId, search, memberId } = filters;

      if (search) {
        query = query.andWhere(
          new Brackets((qb) => {
            qb.where("LOWER(news.title)  like LOWER(:title)", {
              title: "%" + search + "%",
            })
              .orWhere("LOWER(member.firstName)  like LOWER(:firstName)", {
                firstName: "%" + search + "%",
              })
              .orWhere("LOWER(member.lastName)  like LOWER(:lastName)", {
                lastName: "%" + search + "%",
              });
          })
        );
      }

      if (organisationId) {
        query = query.andWhere("organisation.id = :organisationId", {
          organisationId: organisationId,
        });
      }

      if (memberId) {
        query = query.andWhere("member.id = :memberId", {
          memberId: memberId,
        });
      }
    }

    if (paginationValue) {
      // Pagination
      const page = parseInt(pagination.page, 10) || 1;
      const limit = 9;
      const startIndex = (page - 1) * limit;

      //with pagination
      return await NewsRepository.getNews(query, startIndex, limit);
    }
    //without pagination
    return await NewsRepository.getAllNews(query);
  }

  static async updateNews(body: News, newsId: number, files: any) {
    await NewsRepository.updateNews(body, newsId);
    const news = await this.getNewsById(newsId);

    if (files && files.file) {
      const fileName = await this.storeUploadedFile(news.id, files);
      news.fileName = fileName;
      news.filePath = `http://localhost:${this.port}/static/news_${news.id}/${fileName}`;
    }

    return await NewsRepository.saveNews(news);
  }

  static async deleteNews(newsId: number) {
    return await NewsRepository.deleteNews(newsId);
  }
}
