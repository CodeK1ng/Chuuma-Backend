import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Customer } from "./customer.entity";

@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    msisdn: string;

    @Column()
    account_type_id: number;

    @Column({type: "double", precision:12, scale: 6})
    balance: number;

    @ManyToOne(type => Customer, customer => customer.accounts)
    customer: Customer;

    @Column()
    created_at: string;

    @Column()
    updated_at: string;
}