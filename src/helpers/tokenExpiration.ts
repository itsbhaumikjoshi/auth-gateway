import Session from "../entities/Session";

export const setSessionExpiration = (days: number): Date => {
    const expxiration = new Date();
    expxiration.setTime(expxiration.getTime() + (days * 24 * 60 * 60 * 1000));
    return expxiration;
};

export const hasSessionExpired = (expiresAt: Date): boolean => {
    return ((expiresAt.getTime() - Date.now()) / 1000) > 0 ? false : true;
};

export const isSessionValid = async (session: Session): Promise<boolean> => {
    if (hasSessionExpired(session.expiresAt)) {
        await session.softRemove();
        return false;
    }
    return true;
};