import { Transaction } from "src/entities/transaction.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(Transaction)
export class TransactionRepository extends Repository<Transaction>{}