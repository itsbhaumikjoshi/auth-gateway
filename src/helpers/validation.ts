/**
 * Description - False is returned if id is valid
 */
export const isIdValid = (id: string): boolean => (id && /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/i.test(id)) ? false : true;