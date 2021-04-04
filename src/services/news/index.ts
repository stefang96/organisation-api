import { News } from "../../entities/news.model";
import { NewsRepository } from "../../repositories/news";
import moment = require("moment");
import jwt from "jsonwebtoken";
import fs from "fs";
import { getManager, Brackets } from "typeorm";

export class NewsService {
  private static public = process.env.PUBLIC_FOLDER;
  private static port = process.env.SERVER_PORT;

  static async createNews(body: any, files: any) {
    const loggedUser = jwt.decode(body.token);

    const { title, shortDescription, description } = body;

    const news = new News();
    news.title = title;
    news.description = description;
    news.shortDescription = shortDescription;
    news.member = loggedUser.id;
    news.createdAt = moment().unix();
    news.active = true;

    let fileNews = files.file;
    if (files.file.length > 1) {
      fileNews = files.file[0];
    }

    const createdNews = await NewsRepository.createNews(news);
    const filePath = `${this.public}/news_${createdNews.id}`;

    fs.mkdir(filePath, (err) => {
      if (err) {
        throw new Error("Error directory created");
      }
      console.log("Directory created successfully!");
    });

    fileNews.mv(`${filePath}/${fileNews.name}`, (res, err) => {
      if (err) {
        console.log(err);
        throw new Error("Error occured");
      }
    });

    createdNews.fileName = fileNews.name;
    createdNews.filePath = `http://localhost:${this.port}/static/news_${createdNews.id}/${fileNews.name}`;

    return await NewsRepository.createNews(createdNews);
  }

  static async getNewsById(newsId: number) {
    return await NewsRepository.getNewsById(newsId);
  }

  static async getNews(body: any, paginationValue = false) {
    console.log(body);
    const { pagination, filters } = body;

    let query = getManager()
      .getRepository(News)
      .createQueryBuilder("news")
      .leftJoinAndSelect("news.member", "member")
      .leftJoinAndSelect("member.organisation", "organisation")
      .where("news.active = :active", { active: true });

    if (body.token) {
      const loggedUser = jwt.decode(body.token);
      query = query.andWhere("organisation.id = :organisationId", {
        organisationId: loggedUser.organisation.id,
      });
      console.log(loggedUser);
    }

    if (body.filters) {
      const { organisationId, search } = filters;

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
    }

    if (paginationValue) {
      // Pagination
      const page = parseInt(pagination.page, 10) || 1;
      const limit = 10;
      const startIndex = (page - 1) * limit;

      //with pagination
      return await NewsRepository.getNews(query, startIndex, limit);
    }
    //without pagination
    return await NewsRepository.getAllNews(query);
  }

  static async updateNews(body: News, newsId: number) {
    await NewsRepository.updateNews(body, newsId);

    return await this.getNewsById(newsId);
  }

  static async deleteNews(newsId: number) {
    //
  }
}
