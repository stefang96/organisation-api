import { MemberRepository } from "../../repositories/member";

export class MemberHelper{

    static async memberEmailExist(email){

       

        const members = await MemberRepository.getUserByEmail(email);

       

        if(members){
            return true;
        }

        return false;

    }
}