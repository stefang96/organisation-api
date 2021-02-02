import {Entity, PrimaryGeneratedColumn, Column,OneToMany} from "typeorm";
import { Member } from "./member.model";

@Entity('organisation')
export class Organisation {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({name:"Name",nullable:false})
    name: string;

    @Column({name:"Address",nullable:true})
    address: string;

    @Column({name:"Type",nullable:false})
    type: string;

    @Column({name:"NumberOfEmployees",nullable:true})
    numberOfEmployees: number;

    @Column({ name: "Active", default: true })
    active: boolean;

    @Column({ name: "CreatedAt", nullable: true })
    createdAt: number;

    @OneToMany(() => Member, member => member.organisation)
    members: Member[];



}