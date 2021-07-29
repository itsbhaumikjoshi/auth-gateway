import Session from "../entities/Session";

export const setTokenExpiration = (days: number): Date => {
    const expxiration = new Date();
    expxiration.setTime(expxiration.getTime() + (days * 24 * 60 * 60 * 1000));
    return expxiration;
};

export const hasTokenExpired = (expiresAt: Date): boolean => {
    return ((expiresAt.getTime() - Date.now()) / 1000) > 0 ? false : true;
};

export const isSessionValid = async (session: Session): Promise<boolean> => {
    if (hasTokenExpired(session.expiresAt)) {
        await session.remove();
        return false;
    }
    return true;
};