import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class UnitPrice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'decimal' })
    unitPrice: number;

    @Column()
    created_at: string;

    @Column()
    updated_at: string;
}