import { Request, Response, Router } from "express";
import { getToken } from "../../../middleware";
import { OrganisationService } from "../../../services/organisation";
import { ResponseBuilder } from "../../../utilities/response";

export class OrganisationRoutes {
  private router: Router = Router();

  public getRouter(): Router {
    this.router.get("/:organisationId", async (req: Request, res: Response) => {
      try {
        const newsId = req.params.organisationId;
        const result = await OrganisationService.getOrganisationById(
          Number(newsId)
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

    this.router.put("/all", getToken, async (req: Request, res: Response) => {
      try {
        let result = null;
        let total = null;
        let page = null;
        let limit = null;
        console.log(req.body);
        if (req.body.pagination) {
          result = await OrganisationService.getAllOrganisation(req.body, true);
          total = await OrganisationService.getAllOrganisation(req.body);
          page = parseInt(req.body.pagination.page, 10) || 1;
          limit = 1;

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
          result = await OrganisationService.getAllOrganisation(req.body);

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

    this.router.put("/:organisationId", async (req: Request, res: Response) => {
      try {
        const organisationId = req.params.newsId;
        const result = await OrganisationService.updateOrganisation(
          req.body,
          Number(organisationId)
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

    this.router.delete(
      "/:organisationId",
      async (req: Request, res: Response) => {
        try {
          const organisationId = req.params.organisationId;
          const result = await OrganisationService.deleteOrganisation(
            Number(organisationId)
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
      }
    );

    return this.router;
  }
}
