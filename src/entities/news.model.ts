import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Member } from "./member.model";

@Entity("news")
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "Title", nullable: false })
  title: string;

  @Column({ name: "ShortDescription", nullable: true })
  shortDescription: string;

  @Column({ name: "Description", nullable: true })
  description: string;

  @Column({ name: "CreatedAt", nullable: true })
  createdAt: number;

  @Column({ name: "FilePath", nullable: true })
  filePath: string;

  @Column({ name: "FileName", nullable: true })
  fileName: string;

  @ManyToOne(() => Member, (member) => member.news)
  member: Member;
}