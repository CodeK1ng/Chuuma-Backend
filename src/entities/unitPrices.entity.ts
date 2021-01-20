import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class UnitPrice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("double")
    unitPrice: number;

    @Column()
    created_at: string;

    @Column()
    updated_at: string;
}