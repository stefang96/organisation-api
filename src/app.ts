import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import "reflect-metadata";
import { createConnection } from "typeorm";
import * as appConfig from "./config";
import * as routes from "./routes/routes";
import cors from "cors";
import fileUpload from "express-fileupload";

dotenv.config();

const app: Application = express();

//app.use(express.static("public")); //to access the files in public folder
app.use(fileUpload()); //enable multipart/form-data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//obavezno
app.use(
  cors({
    origin: "*",
  })
);

/**
 * Sample of ROOT URL
 *
 * @name welcome
 *
 * @param {express.Request} req
 * @param {express.Response} res
 *
 * @return {express.Response.body}
 */
app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Welcome to Organisation api.</h1>");
});

app.use("/static", express.static("public"));

routes.apiRoutes(app).catch((e) => console.log("Error: " + e));

createConnection(appConfig.dbOptions)
  .then(async (connection) => {
    console.log("Connected to DB");
  })
  .catch((error) => console.log("TypeORM connection error: ", error));

export { app };
