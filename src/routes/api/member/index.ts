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
    return this.router;
  }
}
