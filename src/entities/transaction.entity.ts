import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Customer } from "./customer.entity";

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    msisdn: string;

    @Column({type: "double", precision:12, scale: 6})
    amount: number;

    @Column({type: "double", precision:12, scale: 6})
    units: number;

    @Column({type: "double", precision:12, scale: 6})
    unitPrice: number;

    @Column({nullable: true})
    tenure: number;

    @Column()
    status: TransactionStatus;

    @Column()
    acountTypeId: number;

    @Column()
    serviceId: number;

    @Column({type: "double", precision:12, scale: 6})
    balance: number;
    
    @Column()
    maturity_unit_price: number;

    @Column()
    movedToWithdraws: number;

    @Column({nullable: true})
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