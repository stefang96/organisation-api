import * as express from 'express';
import { AuthRoutes } from './api/auth';
 


export async function apiRoutes(app: express.Application) {
    app.use('/auth',new AuthRoutes().getRouter());
    
}