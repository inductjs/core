import { UserRole } from "../lib/schemas/basic-user";

export interface UserData {
    email: string;
    userId: number;
    role: UserRole;
    firstName: string;
    lastName: string;
}
