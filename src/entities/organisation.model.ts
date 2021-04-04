import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Content } from "./abstract/content";
import { Member } from "./member.model";

@Entity("organisation")
export class Organisation extends Content {
  @Column({ name: "Name", nullable: false })
  name: string;

  @Column({ name: "Address", nullable: true })
  address: string;

  @Column({ name: "Type", nullable: false })
  type: string;

  @Column({ name: "NumberOfEmployees", nullable: true })
  numberOfEmployees: number;

  @OneToMany(() => Member, (member) => member.organisation)
  members: Member[];
}
