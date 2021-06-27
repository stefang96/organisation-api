import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Content } from "./abstract/content";
import { Member } from "./member.model";

@Entity("payments")
export class Payments extends Content {
  @Column({ name: "FromDate", nullable: true })
  fromDate: number;

  @Column({ name: "ToDate", nullable: true })
  toDate: number;

  @Column({ name: "Price", nullable: true })
  price: number;

  @ManyToOne(() => Member, (member) => member.payments, { onDelete: "CASCADE" })
  member: Member;
}
