import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Content } from "./abstract/content";
import { Member } from "./member.model";

@Entity("news")
export class News extends Content {
  @Column({ name: "Title", nullable: false })
  title: string;

  @Column({ name: "ShortDescription", nullable: true })
  shortDescription: string;

  @Column({ name: "Description", nullable: true })
  description: string;

  @Column({ name: "FilePath", nullable: true })
  filePath: string;

  @Column({ name: "FileName", nullable: true })
  fileName: string;

  @ManyToOne(() => Member, (member) => member.news, { onDelete: "CASCADE" })
  member: Member;
}
