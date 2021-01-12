import { User } from "src/entities/user.entity";

export class SuccessResponse {
    status: number;
    message: string;
    body: any

}

export class ErrorResponse {
    status: number;
    message: string;
    error: string;
}