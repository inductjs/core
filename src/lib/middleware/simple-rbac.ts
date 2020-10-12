import {Request, Response, NextFunction} from "express";
import { unauthorized } from "../../express/result-helpers";
import { UserData } from "../../types/generic-user";

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
    namespace Express {
        interface Request {
            user: UserData;
        }
    }
}

export const createRbacMiddleware = () => {
    // room for configuration with options here
    // Logic for different RBAC types?

    return async function adminCheck(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        if (req.user.role === "admin") {
            next();
        } else {
            unauthorized(res);
        }
    };
};
