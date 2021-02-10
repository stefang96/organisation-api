import { getManager, getRepository } from "typeorm";
import { Member } from "../../entities/member.model";

export class MemberRepository {

    static async saveContactPerson(contactPerson:any){
        return await getManager().getRepository(Member).save(contactPerson)
    }

    static async saveMember(member:any){
        return await getManager().getRepository(Member).save(member)
    }

    static async getMemberByEmail(email){
        return await getManager().getRepository(Member).findOne( {email:email} ,{
            relations: [
              "organisation",
            ],
          });
    }

    static async getVerifyMember(query){
        const {email,verifytoken} =query;

        return await getManager().getRepository(Member).findOne({ email:email,verifytoken:verifytoken });

    }

    static async getSetPasswordMember(params:any){
        const {email,setpasswordtoken} =params;

        return await getManager().getRepository(Member).findOne({ email:email,setpasswordtoken:setpasswordtoken });

    }

}