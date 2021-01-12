import { BalanceToWithdraw } from "src/entities/balanceToWithdraw.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(BalanceToWithdraw)
export class BalanceToWithdrawRepository extends Repository<BalanceToWithdraw>{}