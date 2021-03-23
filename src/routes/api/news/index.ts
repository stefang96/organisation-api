import { Request, Response, Router } from "express";
import { News } from "../../../entities/news.model";
import { AuthServices } from "../../../services/auth";
import { NewsService } from "../../../services/news";
import { ResponseBuilder } from "../../../utilities/response";
import { getToken } from "../../../middleware/index";

export class NewsRoutes {
  private router: Router = Router();
  private folder = process.env.PUBLIC_FOLDER;

  public getRouter(): Router {
    this.router.post("/", getToken, async (req: any, res: any) => {
      try {
        const result = await NewsService.createNews(req.body, req.files);

        return new ResponseBuilder<any>()
          .setData(result)
          .setStatus(true)
          .setResponse(res)
          .setResponseStatus(201)
          .build();
      } catch (error) {
        return new ResponseBuilder<any>()
          .setData(error.message)
          .setStatus(false)
          .setResponse(res)
          .setResponseStatus(400)
          .build();
      }
    });

    this.router.get("/:newsId", async (req: Request, res: Response) => {
      try {
        const newsId = req.params.newsId;
        const result = await NewsService.getNewsById(Number(newsId));

        return new ResponseBuilder<any>()
          .setData(result)
          .setStatus(true)
          .setResponse(res)
          .setResponseStatus(200)
          .build();
      } catch (error) {
        return new ResponseBuilder<any>()
          .setData(error.message)
          .setStatus(false)
          .setResponse(res)
          .setResponseStatus(400)
          .build();
      }
    });

    this.router.put("/all", async (req: Request, res: Response) => {
      try {
        const result = await NewsService.getNews(req.body, true);
        const total = await NewsService.getNews(req.body);
        const page = parseInt(req.body.pagination.page, 10) || 1;
        const limit = 9;

        return new ResponseBuilder<any>()
          .setData(result)
          .setStatus(true)
          .setMeta({
            limit,
            total: total.length,
            offset: (page - 1) * limit,
            page,
          })
          .setResponse(res)
          .setResponseStatus(200)
          .build();
      } catch (error) {
        return new ResponseBuilder<any>()
          .setData(error.message)
          .setStatus(false)
          .setResponse(res)
          .setResponseStatus(400)
          .build();
      }
    });

    this.router.put("/:newsId", async (req: Request, res: Response) => {
      try {
        const newsId = req.params.newsId;
        const result = await NewsService.updateNews(req.body, Number(newsId));

        return new ResponseBuilder<any>()
          .setData(result)
          .setStatus(true)
          .setResponse(res)
          .setResponseStatus(200)
          .build();
      } catch (error) {
        return new ResponseBuilder<any>()
          .setData(error.message)
          .setStatus(false)
          .setResponse(res)
          .setResponseStatus(400)
          .build();
      }
    });

    return this.router;
  }
}
