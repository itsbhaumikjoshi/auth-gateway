import { NextFunction, Request, Response } from "express";
import User, { UserRole } from "../entities/User";

export default async function(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.params;
    if(!userId)
        return res.status(400).json({ message: "User Id is missing" });
    try {
        const user = await User.findOne({ where: { id: userId } });
        if(user?.role === UserRole.ADMIN) {
            return true;        
        }
        return res.status(403).json({ message: "The action is forbidden" });
    } catch (error) {
        next(error);
    }
}