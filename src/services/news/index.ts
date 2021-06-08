import { News } from "../../entities/news.model";
import { NewsRepository } from "../../repositories/news";
import moment = require("moment");
import jwt from "jsonwebtoken";
import fs from "fs";
import { getManager, Brackets } from "typeorm";
import { getToken } from "../../middleware";

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

    const createdNews = await NewsRepository.saveNews(news);

    const filePath = `${this.public}/news_${createdNews.id}`;

    fs.mkdir(filePath, (err) => {
      if (err) {
        throw new Error("Error directory created");
      }
      console.log("Directory created successfully!");
    });

    if (files) {
      let fileNews = files.file;
      if (files.file.length > 1) {
        fileNews = files.file[0];
      }

      fileNews.mv(`${filePath}/${fileNews.name}`, (res, err) => {
        if (err) {
          console.log(err);
          throw new Error("Error occured");
        }
      });

      createdNews.fileName = fileNews.name;
      createdNews.filePath = `http://localhost:${this.port}/static/news_${createdNews.id}/${fileNews.name}`;
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
      const loggedUser = jwt.decode(body.token);
      if (loggedUser.role !== "super_admin") {
        query = query.andWhere("organisation.id = :organisationId", {
          organisationId: loggedUser.organisation.id,
        });
      }
    }

    if (body.memberId) {
      query = query.andWhere("member.id = :memberId", {
        memberId: body.memberId,
      });
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
    console.log(body);
    console.log(files);
    await NewsRepository.updateNews(body, newsId);
    const news = await this.getNewsById(newsId);
    console.log(news);
    if (files) {
      let fileNews = files.file;
      if (files.file.length > 1) {
        fileNews = files.file[0];
      }

      const filePath = `${this.public}/news_${news.id}`;

      fileNews.mv(`${filePath}/${fileNews.name}`, (res, err) => {
        if (err) {
          console.log(err);
          throw new Error("Error occured");
        }
      });

      news.fileName = fileNews.name;
      news.filePath = `http://localhost:${this.port}/static/news_${news.id}/${fileNews.name}`;
    }

    return await NewsRepository.saveNews(news);
  }

  static async deleteNews(newsId: number) {
    return await NewsRepository.deleteNews(newsId);
  }
}
