import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    name: string;

    @Column()
    Desciption: string;

    @Column()
    created_at: string;

    @Column()
    updated_at: string;
}