import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { News } from "./news.model";
import { Organisation } from "./organisation.model";

export enum MembersRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  MEMBER = "member",
}

@Entity("member")
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "FirstName", nullable: false })
  firstName: string;

  @Column({ name: "LasttName", nullable: false })
  lastName: string;

  @Column({ name: "Email", nullable: false })
  email: string;

  @Column({ name: "Password", nullable: true })
  password: string;

  @Column({ name: "Phone", nullable: true })
  phone: string;

  @Column({
    name: "Role",
    type: "enum",
    enum: MembersRole,
    default: MembersRole.MEMBER,
  })
  role: MembersRole;

  @Column({ name: "Active", default: false })
  active: boolean;

  @Column({ name: "Verified", default: false })
  verified: boolean;

  @Column({ name: "VerifyToken", nullable: true })
  verifytoken: string;

  @Column({ name: "SetPasswordToken", nullable: true })
  setpasswordtoken: string;

  @Column({ name: "CreatedAt", nullable: true })
  createdAt: number;

  @ManyToOne(() => Organisation, (organisation) => organisation.members)
  organisation: Organisation;

  @OneToMany(() => News, (news) => news.member)
  news: News;
}
