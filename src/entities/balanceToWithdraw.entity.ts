import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Customer } from "./customer.entity";

@Entity()
export class BalanceToWithdraw {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    msisdn: string;

    @Column()
    account_type_id: number;

    @Column({type: "double", precision:12, scale: 6})
    balance: number;

    @Column()
    created_at: string;

    @Column()
    updated_at: string;

    @ManyToOne(type => Customer, customer => customer.balanceToWithdraw)
    customer: Customer;
}