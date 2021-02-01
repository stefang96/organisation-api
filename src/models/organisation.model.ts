import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity('organisation')
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({name:"Name",nullable:false})
    name: string;

    @Column({name:"Address",nullable:true})
    address: string;


    @Column({ name: "Active", default: true })
    active: boolean;

    @Column({ name: "CreatedAt", nullable: true })
    createdAt: number;

   

}