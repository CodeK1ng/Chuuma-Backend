import { Product } from "src/entities/product.entity";
import { Service } from "src/entities/service.entity";

export class InvetsDTO {
    msisdn: string;
    amount: number;
    tenure: number;
    productId: number;
    serviceId: number;
}