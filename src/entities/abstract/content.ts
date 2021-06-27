import { PrimaryGeneratedColumn, Column } from "typeorm";

//https://typeorm.io/#/entity-inheritance
export abstract class Content {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "CreatedAt", nullable: true })
  createdAt: number;

  @Column({ name: "Active", default: false })
  active: boolean;
}
