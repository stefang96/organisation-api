import dotenv from 'dotenv';
import express, {Application, Request, Response} from 'express';
import * as bodyParser from "body-parser";
import "reflect-metadata";
import {createConnection} from "typeorm";
import * as appConfig from "./config";
import * as routes from './routes/routes';

dotenv.config();


const PORT = process.env.SERVER_PORT;

const app:Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

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
app.get( "/", ( req: Request, res: Response) => {
    res.send( "<h1>Welcome to Organisation api.</h1>" );
});

routes.apiRoutes(app).catch((e) => console.log("Error: "+ e));

app.listen( PORT, () => {
    console.log("Server started at http://localhost:", PORT);
});

createConnection(appConfig.dbOptions).then(async connection => {
     
   console.log("Connected to DB");
}).catch(error =>console.log("TypeORM connection error: ", error));