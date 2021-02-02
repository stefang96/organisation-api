import { Request, Response, Router } from "express";
import { AuthServices } from "../../../services/auth";
import { ResponseBuilder } from "../../../utilities/response";


export class AuthRoutes {

    private router:Router= Router()

    public getRouter():Router {

        this.router.post('/register',async (req:Request,res:Response)=>{

            try {
                const result = await AuthServices.register(req.body);

                
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
        })

        this.router.post('/login',async (req:Request,res:Response)=>{

            try {
                const result = await AuthServices.login(req.body);

                return new ResponseBuilder<any>()
                .setData(result)
                .setStatus(true)
                .setResponse(res)
                .setResponseStatus(201)
                .build();

            } catch (error) {
                return new ResponseBuilder<any>()
                .setData(error)
                .setStatus(false)
                .setResponse(res)
                .setResponseStatus(400)
                .build();
            }
        });

        this.router.get("/verify", async (req: Request, res: Response) => {
            try {
            //  const result = await MembershipUserService.verify(req, res);
       
               console.log(req.params);
               console.log(req.query);
            } catch (e) {
              return new ResponseBuilder<any>()
                .setData(e)
                .setStatus(false)
                .setResponse(res)
                .setResponseStatus(400);
            }
          });

        return this.router;
    }
}