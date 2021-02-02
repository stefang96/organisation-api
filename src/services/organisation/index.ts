import { Organisation } from "../../entities/organisation.model";
import { OrganisationRepository } from "../../repositories/organisation";
import { OrganisationValidation } from "../../utilities/organisation/validation";

export class OrganisationService{

    static async createPublicOrganisation(organisation:any){
        // Organisation validaton
       
        const isValid = await OrganisationValidation.validateOragnisaion(organisation);
       
        if(!isValid){
            throw new Error("Validation error!")
        }
         
        const newOrganisation = new Organisation();
        newOrganisation.name=organisation.name;
        newOrganisation.numberOfEmployees=organisation.numberOfEmployees;
        newOrganisation.type=organisation.type;
        newOrganisation.address=organisation.address;
        newOrganisation.active=false;

      
        return await OrganisationRepository.createOrganisation(newOrganisation);

    }
}