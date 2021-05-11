import { Request, Response, Router } from "express";
import { News } from "../../../entities/news.model";
import { AuthServices } from "../../../services/auth";
import { NewsService } from "../../../services/news";
import { ResponseBuilder } from "../../../utilities/response";
import { getToken } from "../../../middleware/index";
import { PaymentsService } from "../../../services/payments";

export class PaymentsRoutes {
  private router: Router = Router();

  public getRouter(): Router {
    this.router.post("/", getToken, async (req: any, res: any) => {
      try {
        console.log(req.body);
        const result = await PaymentsService.createPayments(req.body);

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

    this.router.get("/:paymentsId", async (req: Request, res: Response) => {
      try {
        const paymentsId = req.params.paymentsId;
        const result = await PaymentsService.getPaymentsById(
          Number(paymentsId)
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

    this.router.get("/payment/latest", async (req: Request, res: Response) => {
      try {
        const token = req.headers.authorization.toString().split(" ")[1];
        const result = await PaymentsService.getLatestPayment(token);

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
          result = await PaymentsService.getPayments(req.body, true);
          total = await PaymentsService.getPayments(req.body);
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
          result = await PaymentsService.getPayments(req.body);

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

    this.router.delete("/:paymentsId", async (req: Request, res: Response) => {
      try {
        const paymentsId = req.params.paymentsId;
        const result = await PaymentsService.deletePayments(Number(paymentsId));

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
