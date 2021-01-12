import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

@Entity()
export class Service {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    serviceName: string;

    @Column()
    Desciption: string;

    @Column()
    created_at: string;

    @Column()
    updated_at: string;
}