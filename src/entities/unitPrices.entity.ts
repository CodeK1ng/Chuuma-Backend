import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class UnitPrice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "double", precision:12, scale: 6})
    unitPrice: number;

    @Column()
    created_at: string;

    @Column()
    updated_at: string;
}