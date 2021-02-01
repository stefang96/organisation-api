import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

export enum MembersRole {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    MEMBER = "member",
     
}

@Entity('member')
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({name:"FirstName",nullable:false})
    firstName: string;

    @Column({name:"LasttName",nullable:false})
    lastName: string;

    @Column({name:"Email", nullable:false})
    email: string;

    @Column({name:"Phone", nullable:true})
    phone: string;

    @Column({
        name: "Role",
        type: "enum",
        enum: MembersRole,
        default: MembersRole.MEMBER,
      })
    role: MembersRole;


    @Column({ name: "Active", default: true })
    active: boolean;

    @Column({ name: "CreatedAt", nullable: true })
    createdAt: number;

}