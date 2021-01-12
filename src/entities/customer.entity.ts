import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { Account } from "./accounts.entity";
import { BalanceToWithdraw } from "./balanceToWithdraw.entity";
import { Transaction } from "./transaction.entity";
import { User } from "./user.entity";

@Entity()
export class Customer{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    msisdn: string;

    @Column()
    idNumber: string;

    @Column({nullable: true})
    dob: Date;

    @Column()
    status: number;

    @OneToMany(type => Account, account => account.customer)
    accounts: Account[]

    @OneToMany(type => Transaction, transaction => transaction.customer)
    transaction: Transaction[]

    @OneToMany(type => BalanceToWithdraw, balToWith => balToWith.customer)
    balanceToWithdraw: BalanceToWithdraw[]

    @OneToOne(() => User, user => user.customer)
    @JoinColumn()
    user: User;

    @Column()
    created_at: string;

    @Column()
    updated_at: string;
}
