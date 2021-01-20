import { UnitPrice } from "src/entities/unitPrices.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(UnitPrice)
export class UnitPricesRepository extends Repository<UnitPrice>{}