import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToOne, JoinColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import { Customer } from "./customer.entity";

@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }

    async comparePassword(attempt: string) {
        return await bcrypt.compare(attempt, this.password);
    }

    @Column()
    msisdn: string;

    @Column({nullable: true})
    address: string;

    @Column()
    created_at: string;

    @Column()
    updated_at: string;

    @OneToOne(() => Customer, customer => customer.user) // specify inverse side as a second parameter
    customer: Customer;
}