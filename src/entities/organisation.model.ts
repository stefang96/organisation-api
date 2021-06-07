import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Content } from "./abstract/content";
import { Member } from "./member.model";

@Entity("organisation")
export class Organisation extends Content {
  @Column({ name: "Name", nullable: false })
  name: string;

  @Column({ name: "Address", nullable: true })
  address: string;

  @Column({ name: "Type", nullable: true })
  type: string;

  @Column({ name: "NumberOfEmployees", nullable: true })
  numberOfEmployees: number;

  @Column({ name: "Price", nullable: true })
  price: number;

  @OneToOne(() => Member)
  @JoinColumn()
  contactPerson: Member;

  @OneToMany(() => Member, (member) => member.organisation)
  members: Member[];
}
