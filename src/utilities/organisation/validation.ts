import joi from 'joi';

export class OrganisationValidation{

    static async validateOragnisaion(body:any){
        const schema = joi.object().keys({
            name:joi.string().trim().required().error(new Error('Name is required')),
            type:joi.string().min(2).required().error(new Error('Organisation Type is required.')),
            address:joi.string().min(2).required().error(new Error('Address field is required.')),
            numberOfEmployees:joi.allow(null)

        });

         console.log( schema.validate(body));

        const result =schema.validate(body);

        if(result.error){
            throw new Error(result.error.message);

        }
        else if(result.errors){
            throw new Error(result.errors[0].message);
        }
        else{
            return result.value;
        }
    }
}