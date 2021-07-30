import Session from "../entities/Session";

/**
 * Description - set the session expiration, in days.
*/
export const setSessionExpiration = (days: number): Date => {
    const expxiration = new Date();
    expxiration.setTime(expxiration.getTime() + (days * 24 * 60 * 60 * 1000));
    return expxiration;
};

/**
 * Description - returns true if the session has expired.
*/
export const hasSessionExpired = (expiresAt: Date): boolean => ((expiresAt.getTime() - Date.now()) / 1000) > 0 ? false : true;

/**
 * Description - check if the session is valid, if not remove it.
*/
export const isSessionValid = async (session: Session): Promise<boolean> => {
    if (hasSessionExpired(session.expiresAt)) {
        await session.softRemove();
        return false;
    }
    return true;
};