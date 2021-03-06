import { Request, Response, Router } from "express";
import { News } from "../../../entities/news.model";
import { AuthServices } from "../../../services/auth";
import { NewsService } from "../../../services/news";
import { ResponseBuilder } from "../../../utilities/response";
import { getToken } from "../../../middleware/index";
import { brotliDecompressSync } from "zlib";
import { MemberService } from "../../../services/members";
import { checkMemberEmail } from "../../../middleware";

export class MemberRoutes {
  private router: Router = Router();

  public getRouter(): Router {
    this.router.put(
      "/send-email/contact-person/:memberId",
      checkMemberEmail,
      async (req: any, res: any) => {
        try {
          await MemberService.sendEmailToContactPerson(
            req.body,
            req.params.memberId
          );

          return new ResponseBuilder<any>()
            .setData("Success")
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
      }
    );

    this.router.get("/:memberId", async (req: any, res: any) => {
      try {
        const result = await MemberService.getMemberById(
          Number(req.params.memberId)
        );

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

    this.router.get("/contact-persons/get-all", async (req: any, res: any) => {
      try {
        const result = await MemberService.getAllContactPersons();

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

    this.router.put("/get-all", async (req: any, res: any) => {
      try {
        let result = null;
        let total = null;
        let page = null;
        let limit = null;
        const token = req.headers.authorization.toString().split(" ")[1];

        if (req.body.pagination) {
          result = await MemberService.getAllMembers(req.body, token, true);
          total = await MemberService.getAllMembers(req.body, token);
          page = parseInt(req.body.pagination.page, 10) || 1;
          limit = 10;

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
          result = await MemberService.getAllMembers(req.body, token);

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

    this.router.post("/", getToken, async (req: any, res: any) => {
      try {
        const result = await MemberService.createMember(req.body);

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

    this.router.put("/:memberId", getToken, async (req: any, res: any) => {
      try {
        const result = await MemberService.updateMember(
          req.body,
          Number(req.params.memberId)
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

    this.router.delete("/:memberId", getToken, async (req: any, res: any) => {
      try {
        const result = await MemberService.deleteMember(
          Number(req.params.memberId)
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
    return this.router;
  }
}
