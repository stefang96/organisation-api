import * as express from "express";
import expressJwt from "express-jwt";
import { OrganisationValidation } from "../utilities/organisation/validation";
import { AuthRoutes } from "./api/auth";
import { MemberRoutes } from "./api/member";
import { NewsRoutes } from "./api/news";
import { OrganisationRoutes } from "./api/organisation";
import { PaymentsRoutes } from "./api/payments";

export async function apiRoutes(app: express.Application) {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
  });

  app.use(
    expressJwt({
      secret: process.env.TOKEN_SECRET_KEY,
      algorithms: ["sha1", "RS256", "HS256"],
    }).unless({
      path: [
        "/static/",
        "/api/auth",
        "/api/auth/verify",
        "/api/auth/login",
        "/api/auth/signup",
        "/api/auth/reset-password",
        "/api/auth/set-password",
        "/api/organisation/all",
        "/api/member/get-all",
        "/api/member/contact-persons/get-all",
        { url: /^\/api\/member\/send-email\/.*/, methods: ["PUT"] },
        { url: /^\/api\/news\/.*/, methods: ["GET", "PUT"] },
        { url: /^\/api\/organisation\/.*/, methods: ["GET"] },
      ],
    })
  );

  app.use((err, req, res, next) => {
    if (err.name === "UnauthorizedError") {
      res.status(401).json({ message: "Invalid token." });
    }
  });

  app.use("/api/auth", new AuthRoutes().getRouter());
  app.use("/api/news", new NewsRoutes().getRouter());
  app.use("/api/organisation", new OrganisationRoutes().getRouter());
  app.use("/api/member", new MemberRoutes().getRouter());
  app.use("/api/payments", new PaymentsRoutes().getRouter());
}
