import { getManager, getRepository } from "typeorm";
import { Member } from "../../entities/member.model";
import { Organisation } from "../../entities/organisation.model";

export class OrganisationRepository {

    static async createOrganisation(organisation:Organisation){
      
        return await getManager().getRepository(Organisation).save(organisation)

    }



}