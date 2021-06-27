import { Request, Response, Router } from "express";

import { NewsService } from "../../../services/news";
import { ResponseBuilder } from "../../../utilities/response";
import { getToken } from "../../../middleware/index";

export class NewsRoutes {
  private router: Router = Router();

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

    this.router.put(
      "/get-latest",
      getToken,
      async (req: Request, res: Response) => {
        try {
          const result = await NewsService.getLatestNews(req.body);

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
      }
    );

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

    this.router.put("/all", getToken, async (req: Request, res: Response) => {
      try {
        let result = null;
        let total = null;
        let page = null;
        let limit = null;

        if (req.body.pagination) {
          result = await NewsService.getNews(req.body, true);
          total = await NewsService.getNews(req.body);
          page = parseInt(req.body.pagination.page, 10) || 1;
          limit = 9;

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
        } else {
          result = await NewsService.getNews(req.body);

          return new ResponseBuilder<any>()
            .setData(result)
            .setStatus(true)

            .setResponse(res)
            .setResponseStatus(200)
            .build();
        }
      } catch (error) {
        return new ResponseBuilder<any>()
          .setData(error.message)
          .setStatus(false)
          .setResponse(res)
          .setResponseStatus(400)
          .build();
      }
    });

    this.router.put("/:newsId", async (req: any, res: any) => {
      try {
        const newsId = req.params.newsId;
        const result = await NewsService.updateNews(
          req.body,
          Number(newsId),
          req.files
        );

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

    this.router.delete("/:newsId", async (req: Request, res: Response) => {
      try {
        const newsId = req.params.newsId;
        const result = await NewsService.deleteNews(Number(newsId));

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
