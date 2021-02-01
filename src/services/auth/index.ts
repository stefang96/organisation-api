import { Nodemailer } from "../../utilities/email/nodemailer";

export class AuthServices{

    static async register(body:any){
        //validation user

        const {firstName,lastName,email,phone} = body;

        //check if email already exists

      await Nodemailer.sendInvitationEmail('dddd','stefangrujicic996@gmail.com')
           return 'Email send';
    }

    static async login(body:any){
        return 'Nesto';
 }
}