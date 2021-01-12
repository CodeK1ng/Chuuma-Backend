import { Account } from "src/entities/accounts.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(Account)
export class AccountRepository extends Repository<Account>{}