import { getManager, getRepository } from "typeorm";
import { Member } from "../../entities/member.model";

export class MemberRepository {

    static async saveContactPerson(contactPerson:any){

        return await getManager().getRepository(Member).save(contactPerson)

    }

    static async getUserByEmail(email){

        return await getManager().getRepository(Member).findOne({ email });
    }

}