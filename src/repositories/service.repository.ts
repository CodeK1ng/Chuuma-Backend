import { Service } from "src/entities/service.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(Service)
export class ServiceRepository extends Repository<Service>{}