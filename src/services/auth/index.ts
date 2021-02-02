import { Nodemailer } from "../../utilities/email/nodemailer";
import { MemberService } from "../members";
import { OrganisationService } from "../organisation";

export class AuthServices{

    static async register(body:any){

      
        const organisation ={
            name:body.name,
            numberOfEmployees:body.numberOfEmployees,
            type:body.type,
            address:body.address
        }
        const createdOrganisation = await OrganisationService.createPublicOrganisation(organisation)
      
        const contactPerson ={
            email:body.email,
            firstName:body.firstName,
            lastName:body.lastName,
            phone:body.phone
        }
        await MemberService.createContactPerson(contactPerson,createdOrganisation.id);


        return 'Register success!';
    }

    static async login(body:any){
        return 'Nesto';
 }
}