import { Request, Response, Router } from "express";
import { checkMemberEmail } from "../../../middleware";
import { AuthServices } from "../../../services/auth";
import { ResponseBuilder } from "../../../utilities/response";

export class AuthRoutes {
  private router: Router = Router();

  public getRouter(): Router {
    this.router.post(
      "/signup",
      checkMemberEmail,
      async (req: Request, res: Response) => {
        try {
          console.log(req.body);
          const result = await AuthServices.signup(req.body);

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
      }
    );

    this.router.post("/login", async (req: Request, res: Response) => {
      try {
        const result = await AuthServices.login(req.body);

        if (!result)
          return res.status(400).json({ message: "Incorrect Credentials" });

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

    this.router.get("/verify", async (req: Request, res: Response) => {
      try {
        console.log(req.params);
        console.log(req.query);
        const result = await AuthServices.verifyMember(req.query, res);
      } catch (e) {
        return new ResponseBuilder<any>()
          .setData(e)
          .setStatus(false)
          .setResponse(res)
          .setResponseStatus(400);
      }
    });

    this.router.post("/set-password", async (req: Request, res: Response) => {
      try {
        console.log(req.body);
        await AuthServices.setPassword(req.body);

        const result =
          "Success! Your Password has been set! <br/> <b>Please Log In!<b>";
        return new ResponseBuilder<any>()
          .setData(result)
          .setStatus(true)
          .setResponse(res)
          .setResponseStatus(201)
          .build();
      } catch (e) {
        return new ResponseBuilder<any>()
          .setData(e.message)
          .setStatus(false)
          .setResponse(res)
          .setResponseStatus(400);
      }
    });

    return this.router;
  }
}
