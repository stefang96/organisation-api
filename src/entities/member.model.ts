import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Content } from "./abstract/content";
import { News } from "./news.model";
import { Organisation } from "./organisation.model";

export enum MembersRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  MEMBER = "member",
}

@Entity("member")
export class Member extends Content {
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

  @Column({ name: "ContactPerson", default: false })
  contactPerson: boolean;

  @Column({ name: "Verified", default: false })
  verified: boolean;

  @Column({ name: "VerifyToken", nullable: true })
  verifytoken: string;

  @Column({ name: "SetPasswordToken", nullable: true })
  setpasswordtoken: string;

  @ManyToOne(() => Organisation, (organisation) => organisation.members)
  organisation: Organisation;

  @OneToMany(() => News, (news) => news.member)
  news: News;
}
