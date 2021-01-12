import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Customer } from "./customer.entity";

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    msisdn: string;

    @Column()
    amount: number;

    @Column()
    units: number;

    @Column()
    unitPrice: number;

    @Column()
    tenure: number;

    @Column()
    status: TransactionStatus;

    @Column()
    acountTypeId: number;

    @Column()
    serviceId: number;

    @Column()
    balance: number;
    
    @Column()
    maturity_unit_price: number;

    @Column()
    movedToWithdraws: number;

    @Column()
    externalTransactionID: string;

    @Column()
    maturityDate: string;

    @ManyToOne(type => Customer, customer => customer.transaction)
    customer: Customer;

    @Column()
    created_at: string;

    @Column()
    updated_at: string;
}

export type TransactionStatus = 'Success' | 'Pending' | 'Failed';